import express from 'express';
import { reopenTestCase } from '../controllers/testCaseStatusController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// Reopen a closed test case (admin only)
router.patch('/:id/reopen', authenticateToken, requireRole('admin'), reopenTestCase);

export default router;
