import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import {
  createJobController,
  getJobController,
  listJobsController,
  updateJobController,
  archiveJobController,
  restoreJobController,
} from './jobs.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listJobsController);
router.get('/:id', getJobController);

router.post('/', requireRole('dispatcher'), createJobController);
router.patch('/:id', requireRole('dispatcher'), updateJobController);
router.post('/:id/archive', requireRole('dispatcher'), archiveJobController);
router.post('/:id/restore', requireRole('dispatcher'), restoreJobController);

export default router;