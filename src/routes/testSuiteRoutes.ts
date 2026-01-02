import express from 'express';
import { createTestSuite, getTestSuitesByProject } from '../controllers/testSuiteController';
import { authenticateToken, requireAnyRole } from '../middleware/auth';

const router = express.Router();

router.get('/project/:projectId', authenticateToken, getTestSuitesByProject);
router.post('/', authenticateToken, requireAnyRole(['admin', 'test-lead']), createTestSuite);

export default router;
