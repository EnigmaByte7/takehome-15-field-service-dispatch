import type { Response } from 'express';
import type { AuthedRequest } from '../../types/type.js';
import { listTechnicians } from './users.repository.js';

export async function listTechniciansController(req: AuthedRequest, res: Response) {
  const technicians = await listTechnicians();
  return res.status(200).json(technicians);
}