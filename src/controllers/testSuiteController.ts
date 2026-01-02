import { Request, Response } from 'express';
import { pool } from '../config/db';
import { z } from 'zod';

const testSuiteSchema = z.object({
    project_id: z.number(),
    name: z.string().min(1),
    description: z.string().optional()
});

export const createTestSuite = async (req: Request, res: Response) => {
    try {
        const validatedData = testSuiteSchema.parse(req.body);
        const { project_id, name, description } = validatedData;

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const newSuite = await pool.query(
            'INSERT INTO test_suites (project_id, name, description, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [project_id, name, description, req.user.id]
        );

        res.status(201).json(newSuite.rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ errors: (err as any).errors });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTestSuitesByProject = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM test_suites WHERE project_id = $1 ORDER BY created_at DESC', [projectId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
