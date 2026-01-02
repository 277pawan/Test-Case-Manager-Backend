import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getDashboardAnalytics);

export default router;
