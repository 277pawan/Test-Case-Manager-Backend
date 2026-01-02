import express from 'express';
import { createTestCase, getTestCases, getTestCaseById, getPassedTestCases, updateTestCase } from '../controllers/testCaseController';
import { authenticateToken, requireAnyRole } from '../middleware/auth';
import commentRoutes from './commentRoutes';

const router = express.Router();

router.use('/:testCaseId/comments', commentRoutes);

router.get('/', authenticateToken, getTestCases);
router.get('/passed', authenticateToken, getPassedTestCases);
router.get('/:id', authenticateToken, getTestCaseById);
router.post('/', authenticateToken, requireAnyRole(['admin', 'test-lead', 'tester']), createTestCase);
router.put('/:id', authenticateToken, requireAnyRole(['admin', 'test-lead', 'tester']), updateTestCase);

export default router;
