import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { getSummaryController, getCompletedPerDayController } from './dashboard.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('dispatcher'));

router.get('/summary', getSummaryController);
router.get('/completed-per-day', getCompletedPerDayController);

export default router;