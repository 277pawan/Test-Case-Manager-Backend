import { Request, Response } from 'express';
import { pool, redisClient } from '../config/db';

export const getDashboardAnalytics = async (req: Request, res: Response) => {
    try {
        const cacheKey = 'analytics:dashboard';
        const cachedAnalytics = await redisClient.get(cacheKey);

        if (cachedAnalytics) {
            return res.json(JSON.parse(cachedAnalytics));
        }

        const projectCount = await pool.query('SELECT COUNT(*) FROM projects');
        const testCaseCount = await pool.query('SELECT COUNT(*) FROM test_cases WHERE is_deleted = FALSE');
        const userCount = await pool.query('SELECT COUNT(*) FROM users');

        const executionStats = await pool.query(`
            SELECT status, COUNT(*) as count 
            FROM test_executions 
            GROUP BY status
        `);

        // Priority distribution
        const priorityStats = await pool.query(`
             SELECT priority, COUNT(*) as count
             FROM test_cases
             WHERE is_deleted = FALSE
             GROUP BY priority
        `);

        // Executions over time (last 7 days)
        const executionsOverTime = await pool.query(`
            SELECT DATE(execution_date) as date, COUNT(*) as count
            FROM test_executions
            WHERE execution_date > NOW() - INTERVAL '7 days'
            GROUP BY DATE(execution_date)
            ORDER BY date
        `);

        const analyticsData = {
            counts: {
                projects: parseInt(projectCount.rows[0].count),
                testCases: parseInt(testCaseCount.rows[0].count),
                users: parseInt(userCount.rows[0].count)
            },
            executionStats: executionStats.rows,
            priorityStats: priorityStats.rows,
            executionsOverTime: executionsOverTime.rows
        };

        // Cache for 15 minutes
        await redisClient.setEx(cacheKey, 900, JSON.stringify(analyticsData));

        res.json(analyticsData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
