import { Request, Response } from 'express';
import { pool, redisClient } from '../config/db';
import { z } from 'zod';

const testCaseSchema = z.object({
    project_id: z.number(),
    suite_id: z.number().optional().nullable(),
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
    type: z.enum(['Functional', 'Integration', 'Regression', 'Smoke', 'UI', 'API']),
    pre_conditions: z.string().optional(),
    post_conditions: z.string().optional(),
    assigned_to: z.number().optional().nullable(),
    steps: z.array(z.object({
        step_number: z.number(),
        action: z.string(),
        expected_result: z.string()
    })).optional()
});

export const createTestCase = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const validatedData = testCaseSchema.parse(req.body);
        const { project_id, suite_id, title, description, priority, type, pre_conditions, post_conditions, assigned_to, steps } = validatedData;

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const newTestCaseResult = await client.query(
            `INSERT INTO test_cases (project_id, suite_id, title, description, priority, type, pre_conditions, post_conditions, assigned_to, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [project_id, suite_id, title, description, priority, type, pre_conditions, post_conditions, assigned_to, req.user.id]
        );
        const newTestCase = newTestCaseResult.rows[0];

        if (steps && steps.length > 0) {
            for (const step of steps) {
                await client.query(
                    'INSERT INTO test_steps (test_case_id, step_number, action, expected_result) VALUES ($1, $2, $3, $4)',
                    [newTestCase.id, step.step_number, step.action, step.expected_result]
                );
            }
        }

        await client.query('COMMIT');
        // Invalidate caches
        await redisClient.del('analytics:dashboard');

        res.status(201).json({
            testCase: newTestCase,
            steps: steps || [] // Return the steps that were provided in the input, or an empty array if none.
        });
    } catch (err) {
        await client.query('ROLLBACK');
        if (err instanceof z.ZodError) {
            return res.status(400).json({ errors: (err as any).errors });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

export const getTestCases = async (req: Request, res: Response) => {
    const { projectId, suiteId } = req.query;
    try {
        let query = 'SELECT * FROM test_cases WHERE is_deleted = FALSE';
        const params: any[] = [];
        let paramCount = 1;

        if (projectId) {
            query += ` AND project_id = $${paramCount}`;
            params.push(projectId);
            paramCount++;
        }

        if (suiteId) {
            query += ` AND suite_id = $${paramCount}`;
            params.push(suiteId);
            paramCount++;
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTestCaseById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const testCaseResult = await pool.query('SELECT * FROM test_cases WHERE id = $1 AND is_deleted = FALSE', [id]);
        if (testCaseResult.rows.length === 0) {
            return res.status(404).json({ message: 'Test case not found' });
        }
        const testCase = testCaseResult.rows[0];

        const stepsResult = await pool.query('SELECT * FROM test_steps WHERE test_case_id = $1 ORDER BY step_number ASC', [id]);
        testCase.steps = stepsResult.rows;

        res.json(testCase);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPassedTestCases = async (req: Request, res: Response) => {
    const { projectId } = req.query;
    try {
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        const query = `
            SELECT * FROM test_cases 
            WHERE project_id = $1 
            AND status = 'closed' 
            AND is_deleted = FALSE 
            ORDER BY updated_at DESC
        `;

        const result = await pool.query(query, [projectId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
