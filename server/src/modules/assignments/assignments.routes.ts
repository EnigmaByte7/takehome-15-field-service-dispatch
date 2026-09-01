import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { assignController, unassignController } from './assignments.controller.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.post('/', requireRole('dispatcher'), assignController);
router.delete('/', requireRole('dispatcher'), unassignController);

export default router;