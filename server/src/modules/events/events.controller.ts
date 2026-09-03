import type { Response } from 'express';
import type { AuthedRequest } from '../../types/type.js';
import { getTimeline, addNote } from './events.service.js';

export async function getTimelineController(req: AuthedRequest, res: Response) {
  const { jobId } = req.params;
  if (typeof jobId !== 'string') return res.status(400).json({ error: 'Invalid job id' });

  const result = await getTimeline(req.user!, jobId);

  if (result === 'not_found') return res.status(404).json({ error: 'Job not found' });
  if (result === 'forbidden') return res.status(403).json({ error: 'Not assigned to this job' });

  return res.status(200).json(result);
}

export async function addNoteController(req: AuthedRequest, res: Response) {
  const { jobId } = req.params;
  if (typeof jobId !== 'string') return res.status(400).json({ error: 'Invalid job id' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const result = await addNote(req.user!, jobId, text);

  if (result === 'not_found') return res.status(404).json({ error: 'Job not found' });
  if (result === 'forbidden') return res.status(403).json({ error: 'Not assigned to this job' });

  return res.status(201).json(result);
}