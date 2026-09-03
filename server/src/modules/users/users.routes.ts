import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { listTechniciansController } from './users.controller.js';

const router = Router();

router.use(authMiddleware);
router.get('/technicians', requireRole('dispatcher'), listTechniciansController);

export default router;