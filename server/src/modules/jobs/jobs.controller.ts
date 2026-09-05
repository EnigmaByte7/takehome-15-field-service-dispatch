import type { Response } from 'express';
import type { AuthedRequest } from '../../types/type.js';
import * as jobsService from './jobs.service.js';

export async function createJobController(req: AuthedRequest, res: Response) {
  const actor = req.user!;
  const {
    customerName,
    siteAddress,
    description,
    priority,
    scheduledDate,
    startTime,
    estimatedDurationMinutes,
  } = req.body;

  if (
    !customerName ||
    !siteAddress ||
    !description ||
    !priority ||
    !scheduledDate ||
    !startTime ||
    !estimatedDurationMinutes
  ) {
    return res.status(400).json({ error: 'Missing required job fields' });
  }

  const job = await jobsService.createJob(actor, {
    customerName,
    siteAddress,
    description,
    priority,
    scheduledDate: new Date(scheduledDate),
    startTime: new Date(startTime),
    estimatedDurationMinutes,
  });

  return res.status(201).json(job);
}

export async function getJobController(req: AuthedRequest, res: Response) {
  const actor = req.user!;
  const { jobId } = req.params;
  if (typeof jobId !== 'string') return res.status(400).json({ error: 'Invalid job id' });

  const job = await jobsService.getJob(actor, jobId);

  if (job === null) return res.status(404).json({ error: 'Job not found' });
  if (job === 'forbidden') return res.status(403).json({ error: 'Not assigned to this job' });

  return res.status(200).json(job);
}

export async function listJobsController(req: AuthedRequest, res: Response) {
  const actor = req.user!;
  const q = req.query;

  const result = await jobsService.listJobs(actor, {
    search: typeof q.search === 'string' ? q.search : undefined,
    status: typeof q.status === 'string' ? (q.status as any) : undefined,
    technicianId: typeof q.technicianId === 'string' ? q.technicianId : undefined,
    date: typeof q.date === 'string' ? q.date : undefined,
    sortBy: typeof q.sortBy === 'string' ? (q.sortBy as any) : undefined,
    sortOrder: typeof q.sortOrder === 'string' ? (q.sortOrder as any) : undefined,
    page: q.page ? Number(q.page) : undefined,
    pageSize: q.pageSize ? Number(q.pageSize) : undefined,
    includeArchived: q.archived === 'true',
  });

  return res.status(200).json(result);
}

export async function updateJobController(req: AuthedRequest, res: Response) {
  const { jobId } = req.params;
  if (typeof jobId !== 'string') return res.status(400).json({ error: 'Invalid job id' });

  const { customerName, siteAddress, description, priority, scheduledDate, startTime, estimatedDurationMinutes } = req.body;

  const data: Record<string, unknown> = {};
  if (customerName !== undefined) data.customerName = customerName;
  if (siteAddress !== undefined) data.siteAddress = siteAddress;
  if (description !== undefined) data.description = description;
  if (priority !== undefined) data.priority = priority;
  if (scheduledDate !== undefined) data.scheduledDate = new Date(scheduledDate);
  if (startTime !== undefined) data.startTime = new Date(startTime);
  if (estimatedDurationMinutes !== undefined) data.estimatedDurationMinutes = estimatedDurationMinutes;

  const updated = await jobsService.updateJobDetails(jobId, data);
  return res.status(200).json(updated);
}

export async function archiveJobController(req: AuthedRequest, res: Response) {
  const actor = req.user!;
  const { jobId } = req.params;
  if (typeof jobId !== 'string') return res.status(400).json({ error: 'Invalid job id' });

  const job = await jobsService.archiveJob(actor, jobId);
  return res.status(200).json(job);
}

export async function restoreJobController(req: AuthedRequest, res: Response) {
  const actor = req.user!;
  const { jobId } = req.params;
  if (typeof jobId !== 'string') return res.status(400).json({ error: 'Invalid job id' });

  const job = await jobsService.restoreJob(actor, jobId);
  return res.status(200).json(job);
}

export async function exportDayController(req: AuthedRequest, res: Response) {
  const date = req.query.date as string;
  if (!date) return res.status(400).json({ error: 'date query param is required, e.g. ?date=2026-09-05' });

  const csv = await jobsService.exportDaySheet(date);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="dispatch-${date}.csv"`);
  return res.status(200).send(csv);
}

export async function transitionStatusController(req: AuthedRequest, res: Response) {
  const actor = req.user!;
  const { jobId } = req.params;
  if (typeof jobId !== 'string') return res.status(400).json({ error: 'Invalid job id' });

  const { status, completionNote } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });

  const result = await jobsService.transitionStatus(actor, jobId, status, completionNote);

  if (!result.success) return res.status(409).json({ error: result.reason });
  return res.status(200).json({ success: true });
}