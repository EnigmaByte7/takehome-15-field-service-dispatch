import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { addPartController } from './parts.controller.js';

const router = Router();

router.use(authMiddleware);
router.post('/', addPartController);

export default router;