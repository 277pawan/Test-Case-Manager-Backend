import express from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/projectController';
import { authenticateToken, requireAnyRole, requireRole } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getProjects);
router.get('/:id', authenticateToken, getProjectById);
router.post('/', authenticateToken, requireAnyRole(['admin', 'test-lead']), createProject);
router.put('/:id', authenticateToken, requireAnyRole(['admin', 'test-lead']), updateProject);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteProject);

export default router;
