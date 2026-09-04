import type { Response } from 'express';
import type { AuthedRequest } from '../../types/type.js';
import { assignTechnician, unassignTechnician,bulkAssign } from './assignments.service.js';

export async function assignController(req: AuthedRequest, res: Response) {
  const { technicianId } = req.body;
  if (!technicianId) return res.status(400).json({ error: 'technicianId is required' });

  if(!req.params.jobId || typeof req.params.jobId != 'string') return res.status(400).json({error: "missing jobid"})

  const result = await assignTechnician(req.user!, req.params.jobId, technicianId);
  if (!result.success) return res.status(409).json({ error: result.reason });

  return res.status(200).json({ success: true });
}

export async function unassignController(req: AuthedRequest, res: Response) {
  const { technicianId } = req.body;
  if (!technicianId) return res.status(400).json({ error: 'technicianId is required' });

  if(!req.params.jobId || typeof req.params.jobId != 'string') return res.status(400).json({error: "missing jobid"})

  const result = await unassignTechnician(req.user!, req.params.jobId, technicianId);
  return res.status(200).json(result);
}

export async function bulkAssignController(req: AuthedRequest, res: Response) {
  const actor = req.user!;
  const { jobIds, technicianId } = req.body;
 
  if (!Array.isArray(jobIds) || jobIds.length === 0 || !technicianId) {
    return res.status(400).json({ error: 'jobIds (non-empty array) and technicianId are required' });
  }
 
  const results = await bulkAssign(actor, jobIds, technicianId);
  return res.status(200).json({ results });
}
 