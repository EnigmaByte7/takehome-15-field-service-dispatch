import type { Response } from 'express';
import type { AuthedRequest } from '../../types/type.js';
import { getSummary, getCompletedPerDay } from './dashboard.service.js';

export async function getSummaryController(req: AuthedRequest, res: Response) {
  const summary = await getSummary();
  return res.status(200).json(summary);
}

export async function getCompletedPerDayController(req: AuthedRequest, res: Response) {
  const data = await getCompletedPerDay();
  return res.status(200).json(data);
}