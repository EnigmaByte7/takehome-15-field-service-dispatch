import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { listAlertsController, getAlertCountController, dismissAlertController } from './alerts.controller.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('dispatcher'));

router.get('/', listAlertsController);
router.get('/count', getAlertCountController);
router.post('/:alertId/dismiss', dismissAlertController);

export default router;