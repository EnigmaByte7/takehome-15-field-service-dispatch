import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { getTimelineController, addNoteController } from './events.controller.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.get('/', getTimelineController);
router.post('/notes', addNoteController);

export default router;