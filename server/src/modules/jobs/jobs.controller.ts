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
    if (typeof req.params.id != "string") {
    return res.status(400).json({ message: "Invalid job id" });
  }
  const job = await jobsService.getJob(actor, req.params.id);

  if (job === null) return res.status(404).json({ error: 'Job not found' });
  if (job === 'forbidden') return res.status(403).json({ error: 'Not assigned to this job' });

  return res.status(200).json(job);
}

export async function listJobsController(req: AuthedRequest, res: Response) {
  const actor = req.user!;
  const includeArchived = req.query.archived === 'true';
  const jobs = await jobsService.listJobs(actor, includeArchived);
  return res.status(200).json(jobs);
}

export async function updateJobController(req: AuthedRequest, res: Response) {
    if (typeof req.params.id != "string") {
    return res.status(400).json({ message: "Invalid job id" });
  }
  const updated = await jobsService.updateJobDetails(req.params.id, req.body);
  return res.status(200).json(updated);
}

export async function archiveJobController(req: AuthedRequest, res: Response) {
  const actor = req.user!;
   if (typeof req.params.id != "string") {
    return res.status(400).json({ message: "Invalid job id" });
  } 
  const job = await jobsService.archiveJob(actor, req.params.id);
  return res.status(200).json(job);
}

export async function restoreJobController(req: AuthedRequest, res: Response) {
  const actor = req.user!;
  if (typeof req.params.id != "string") {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const job = await jobsService.restoreJob(actor, req.params.id);
  return res.status(200).json(job);
}