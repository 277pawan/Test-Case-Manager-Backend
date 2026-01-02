import { Router } from 'express';
import { getUsers } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getUsers);

export default router;
