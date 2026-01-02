import express from 'express';
import { createTestCase, getTestCases, getTestCaseById, getPassedTestCases } from '../controllers/testCaseController';
import { authenticateToken, requireAnyRole } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getTestCases);
router.get('/passed', authenticateToken, getPassedTestCases);
router.get('/:id', authenticateToken, getTestCaseById);
router.post('/', authenticateToken, requireAnyRole(['admin', 'test-lead']), createTestCase);

export default router;
