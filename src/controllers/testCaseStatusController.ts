import { Request, Response } from 'express';
import { pool } from '../config/db';

// Reopen a closed test case (admin only)
export const reopenTestCase = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        // Only admin can reopen
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can reopen test cases' });
        }

        const result = await pool.query(
            'UPDATE test_cases SET status = $1 WHERE id = $2 RETURNING *',
            ['open', id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Test case not found' });
        }

        res.json({
            message: 'Test case reopened successfully',
            testCase: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
