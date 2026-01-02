import { Request, Response } from 'express';
import { pool, redisClient } from '../config/db';
import { z } from 'zod';

const executionSchema = z.object({
    test_case_id: z.number(),
    status: z.enum(['Pass', 'Fail', 'Blocked', 'Skipped', 'Pending']),
    actual_result: z.string().optional(),
    comments: z.string().optional()
});

export const executeTest = async (req: Request, res: Response) => {
    try {
        const validatedData = executionSchema.parse(req.body);
        const { test_case_id, status, actual_result, comments } = validatedData;

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        // Check test case status
        const testCase = await pool.query('SELECT status FROM test_cases WHERE id = $1', [test_case_id]);

        if (testCase.rows.length === 0) {
            return res.status(404).json({ message: 'Test case not found' });
        }

        // If test case is closed, only admin can execute
        if (testCase.rows[0].status === 'closed' && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'This test case is closed. Only admins can reopen and re-test it.',
                testCaseStatus: 'closed'
            });
        }

        // Check execution permission: admin always allowed, others need permission
        if (req.user.role !== 'admin') {
            const permissionCheck = await pool.query(
                'SELECT * FROM test_execution_permissions WHERE user_id = $1',
                [req.user.id]
            );

            if (permissionCheck.rows.length === 0) {
                return res.status(403).json({
                    message: 'You do not have permission to execute tests. Please contact an admin to grant you execution permission.',
                    reason: 'no_permission'
                });
            }
        }

        // Insert execution
        const result = await pool.query(
            'INSERT INTO test_executions (test_case_id, executed_by, status, actual_result, comments) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [test_case_id, req.user.id, status, actual_result, comments]
        );

        // If status is 'Pass', automatically close the test case
        if (status === 'Pass') {
            await pool.query(
                'UPDATE test_cases SET status = $1 WHERE id = $2',
                ['closed', test_case_id]
            );
        }

        // Invalidate analytics cache so dashboard updates immediately
        await redisClient.del('analytics:dashboard');

        res.status(201).json({
            ...result.rows[0],
            testCaseClosed: status === 'Pass'
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ errors: (err as any).errors });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getExecutionsByTestCase = async (req: Request, res: Response) => {
    const { testCaseId } = req.params;
    try {
        const result = await pool.query(
            'SELECT te.*, u.username as executed_by_name FROM test_executions te JOIN users u ON te.executed_by = u.id WHERE test_case_id = $1 ORDER BY execution_date DESC',
            [testCaseId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
