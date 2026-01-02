import express from 'express';
import { grantPermission, revokePermission, getPermittedUsers, checkPermission } from '../controllers/executionPermissionController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.post('/grant', authenticateToken, requireRole('admin'), grantPermission);
router.delete('/revoke/:userId', authenticateToken, requireRole('admin'), revokePermission);
router.get('/', authenticateToken, requireRole('admin'), getPermittedUsers);
router.get('/check', authenticateToken, checkPermission);

export default router;
