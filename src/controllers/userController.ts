import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT id, username, email, role FROM users ORDER BY username ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
