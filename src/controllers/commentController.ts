import { Request, Response } from 'express';
import { pool } from '../config/db';
import { z } from 'zod';

const commentSchema = z.object({
    content: z.string().min(1)
});

export const addComment = async (req: Request, res: Response) => {
    const { testCaseId } = req.params;
    const client = await pool.connect();

    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const validatedData = commentSchema.parse(req.body);
        const { content } = validatedData;

        // Verify test case exists
        const testCaseCheck = await client.query('SELECT id FROM test_cases WHERE id = $1', [testCaseId]);
        if (testCaseCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Test case not found' });
        }

        const result = await client.query(
            `INSERT INTO comments (test_case_id, user_id, content) 
             VALUES ($1, $2, $3) 
             RETURNING id, content, created_at, user_id`,
            [testCaseId, req.user.id, content]
        );

        const newComment = result.rows[0];

        // Fetch user details for the response
        const userRes = await client.query('SELECT username FROM users WHERE id = $1', [req.user.id]);
        newComment.username = userRes.rows[0].username;

        res.status(201).json(newComment);

    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ errors: (err as any).errors });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

export const getComments = async (req: Request, res: Response) => {
    const { testCaseId } = req.params;

    try {
        const query = `
            SELECT c.*, u.username 
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.test_case_id = $1
            ORDER BY c.created_at DESC
        `;

        const result = await pool.query(query, [testCaseId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        // Check if comment exists and belongs to user (or admin)
        const commentCheck = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
        if (commentCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const comment = commentCheck.rows[0];
        if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await pool.query('DELETE FROM comments WHERE id = $1', [id]);
        res.json({ message: 'Comment deleted' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
