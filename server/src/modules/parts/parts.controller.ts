import type { Response } from 'express';
import type { AuthedRequest } from '../../types/type.js';
import { addPart } from './parts.service.js';

export async function addPartController(req: AuthedRequest, res: Response) {
  const actor = req.user!;
  const { jobId } = req.params;
  if(typeof jobId != 'string') return res.status(400).json({error: "Invalid job id"})
  const { partName, quantity } = req.body;

  if (!partName || !quantity) {
    return res.status(400).json({ error: 'partName and quantity are required' });
  }

  const result = await addPart(actor, jobId, partName, quantity);

  if (result === 'not_found') return res.status(404).json({ error: 'Job not found' });
  if (result === 'forbidden') return res.status(403).json({ error: 'Not assigned to this job' });
  if (result === 'job_completed') {
    return res.status(400).json({ error: 'Cannot add parts to a completed job' });
  }

  return res.status(201).json(result);
}