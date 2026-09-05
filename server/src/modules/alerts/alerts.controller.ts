import type { Response } from 'express';
import type { AuthedRequest } from '../../types/type.js';
import { listAlerts, getAlertCount, dismissAlert } from './alerts.service.js';

export async function listAlertsController(req: AuthedRequest, res: Response) {
  const alerts = await listAlerts();
  return res.status(200).json(alerts);
}

export async function getAlertCountController(req: AuthedRequest, res: Response) {
  const count = await getAlertCount();
  return res.status(200).json({ count });
}

export async function dismissAlertController(req: AuthedRequest, res: Response) {
  const { alertId } = req.params;
  if (typeof alertId !== 'string') return res.status(400).json({ error: 'Invalid alert id' });

  const result = await dismissAlert(alertId);
  if (result === 'not_found') return res.status(404).json({ error: 'Alert not found' });
  if (result === 'already_dismissed') return res.status(409).json({ error: 'Alert already dismissed' });

  return res.status(200).json({ success: true });
}