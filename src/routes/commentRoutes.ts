import express from 'express';
import { addComment, getComments, deleteComment } from '../controllers/commentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router({ mergeParams: true }); // Enable access to parent params if nested

// Define routes
// Note: We'll likely mount this as /api/comments or nested under /api/test-cases/:testCaseId/comments
// Based on the controller logic using `req.params.testCaseId`, it suggests nested routing or explicit param.
// If mounted as /api/test-cases/:testCaseId/comments, then testCaseId is available.

router.get('/', authenticateToken, getComments);
router.post('/', authenticateToken, addComment);
router.delete('/:id', authenticateToken, deleteComment);

export default router;
