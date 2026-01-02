import { Request, Response } from 'express';
import { pool } from '../config/db';
import { z } from 'zod';

const grantPermissionSchema = z.object({
    email: z.string().email('Invalid email address')
});

// Grant execution permission to a user by email (admin only)
export const grantPermission = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can grant execution permissions' });
        }

        const validatedData = grantPermissionSchema.parse(req.body);
        const { email } = validatedData;

        // Find user by email
        const userResult = await pool.query('SELECT id, username, email, role FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        const targetUser = userResult.rows[0];

        // Check if user already has permission
        const existingPermission = await pool.query(
            'SELECT * FROM test_execution_permissions WHERE user_id = $1',
            [targetUser.id]
        );

        if (existingPermission.rows.length > 0) {
            return res.status(400).json({ message: 'User already has execution permission' });
        }

        // Grant permission
        await pool.query(
            'INSERT INTO test_execution_permissions (user_id, granted_by) VALUES ($1, $2)',
            [targetUser.id, req.user.id]
        );

        res.status(201).json({
            message: 'Execution permission granted successfully',
            user: {
                id: targetUser.id,
                username: targetUser.username,
                email: targetUser.email,
                role: targetUser.role
            }
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ errors: (err as any).errors });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Revoke execution permission from a user (admin only)
export const revokePermission = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can revoke execution permissions' });
        }

        const result = await pool.query(
            'DELETE FROM test_execution_permissions WHERE user_id = $1 RETURNING *',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User does not have execution permission' });
        }

        res.json({ message: 'Execution permission revoked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users with execution permission (admin only)
export const getPermittedUsers = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can view execution permissions' });
        }

        const result = await pool.query(`
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.role,
                p.granted_at,
                granter.username as granted_by_username
            FROM test_execution_permissions p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN users granter ON p.granted_by = granter.id
            ORDER BY p.granted_at DESC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Check if a user has execution permission
export const checkPermission = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        // Admins always have permission
        if (req.user.role === 'admin') {
            return res.json({ hasPermission: true, reason: 'admin' });
        }

        const result = await pool.query(
            'SELECT * FROM test_execution_permissions WHERE user_id = $1',
            [req.user.id]
        );

        res.json({
            hasPermission: result.rows.length > 0,
            reason: result.rows.length > 0 ? 'granted' : 'none'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
