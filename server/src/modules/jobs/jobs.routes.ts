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
  exportDayController,
  transitionStatusController,
} from './jobs.controller.js';

import { bulkAssignController } from '../assignments/assignments.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/export', requireRole('dispatcher'), exportDayController);
router.post('/bulk-assign', requireRole('dispatcher'), bulkAssignController);

router.get('/', listJobsController);
router.get('/:jobId', getJobController);

router.post('/', requireRole('dispatcher'), createJobController);
router.patch('/:jobId', requireRole('dispatcher'), updateJobController);
router.post('/:jobId/archive', requireRole('dispatcher'), archiveJobController);
router.post('/:jobId/restore', requireRole('dispatcher'), restoreJobController);
router.patch('/:jobId/status', requireRole('technician'), transitionStatusController);

export default router;