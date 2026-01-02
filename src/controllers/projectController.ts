import { Request, Response } from 'express';
import { pool, redisClient } from '../config/db';
import { catchAsync } from '../utils/catchAsync';
import { z } from 'zod';

const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    version: z.string().optional(),
});

const updateProjectSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    version: z.string().optional(),
    status: z.enum(['active', 'archived']).optional()
});

export const createProject = async (req: Request, res: Response) => {
    try {
        const validatedData = createProjectSchema.parse(req.body);
        const { name, description, version } = validatedData;

        // Ensure user is authenticated
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const newProject = await pool.query(
            'INSERT INTO projects (name, description, version, status, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, version, 'active', req.user.id]
        );

        // Add creator as a member with 'owner' or 'lead' role if needed, simplified here
        await pool.query(
            'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
            [newProject.rows[0].id, req.user.id, 'lead']
        );

        // Invalidate cache
        await redisClient.del('projects:all');
        await redisClient.del('analytics:dashboard');

        res.status(201).json(newProject.rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ errors: (err as any).errors });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getProjects = async (req: Request, res: Response) => {
    try {
        console.log('getProjects called. User:', req.user);
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        // Admin: Show all projects (use cache)
        if (req.user.role === 'admin') {
            console.log('Admin role detected. Fetching all projects.');
            const cacheKey = 'projects:all';
            const cachedProjects = await redisClient.get(cacheKey);

            if (cachedProjects) {
                return res.json(JSON.parse(cachedProjects));
            }

            const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');

            // Cache for 1 hour
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(result.rows));

            return res.json(result.rows);
        } else {
            console.log('Non-admin role detected. Fetching assigned projects only.');
            console.log('User ID:', req.user.id);

            // Normal User: Show only projects with assigned test cases
            // We do not cache this personalized list for now
            const query = `
                SELECT DISTINCT p.* 
                FROM projects p
                JOIN test_cases tc ON p.id = tc.project_id
                WHERE tc.assigned_to = $1
                ORDER BY p.created_at DESC
            `;
            const result = await pool.query(query, [req.user.id]);
            console.log('Query executed successfully. Rows:', result.rowCount);
            return res.json(result.rows);
        }
    } catch (err) {
        console.error('Error in getProjects:', err);
        res.status(500).json({ message: 'Server error', error: (err as any).message });
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const validatedData = updateProjectSchema.parse(req.body);
        const { name, description, version, status } = validatedData;

        const result = await pool.query(
            'UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), version = COALESCE($3, version), status = COALESCE($4, status), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [name, description, version, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Invalidate cache
        await redisClient.del('projects:all');
        await redisClient.del(`project:${id}`);

        res.json(result.rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ errors: (err as any).errors });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Invalidate cache
        await redisClient.del('projects:all');
        await redisClient.del(`project:${id}`);

        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
