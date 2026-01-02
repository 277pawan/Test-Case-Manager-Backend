import express from 'express';
import { executeTest, getExecutionsByTestCase } from '../controllers/testExecutionController';
import { authenticateToken, requireAnyRole } from '../middleware/auth';

const router = express.Router();

router.get('/test-case/:testCaseId', authenticateToken, getExecutionsByTestCase);
router.post('/', authenticateToken, requireAnyRole(['admin', 'test-lead', 'tester']), executeTest);

export default router;
