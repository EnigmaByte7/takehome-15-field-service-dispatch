import * as jobsRepo from './jobs.repository.js';
import { recordEvent } from '../events/events.service.js';

type Actor = { userId: string; role: 'dispatcher' | 'technician' };

export async function createJob(
  actor: Actor,
  data: {
    customerName: string;
    siteAddress: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    scheduledDate: Date;
    startTime: Date;
    estimatedDurationMinutes: number;
  }
) {
  const job = await jobsRepo.createJob(data);
  await recordEvent(job.id, 'created', actor.userId);
  return job;
}

export async function getJob(actor: Actor, jobId: string) {
  const job = await jobsRepo.findJobById(jobId);
  if (!job) return null;

  if (actor.role === 'technician') {
    const assignment = await jobsRepo.findAssignmentForTechnician(jobId, actor.userId);
    if (!assignment) return 'forbidden' as const;
  }

  return job;
}

export async function listJobs(actor: Actor, includeArchived: boolean) {
  if (actor.role === 'dispatcher') {
    return jobsRepo.listAllJobs(includeArchived);
  }
  return jobsRepo.listJobsForTechnician(actor.userId);
}

export async function updateJobDetails(
  jobId: string,
  data: Partial<{
    customerName: string;
    siteAddress: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    scheduledDate: Date;
    startTime: Date;
    estimatedDurationMinutes: number;
  }>
) {
  return jobsRepo.updateJobDetails(jobId, data);
}

export async function archiveJob(actor: Actor, jobId: string) {
  const job = await jobsRepo.setArchived(jobId, new Date());
  await recordEvent(jobId, 'archived', actor.userId);
  return job;
}

export async function restoreJob(actor: Actor, jobId: string) {
  const job = await jobsRepo.setArchived(jobId, null);
  await recordEvent(jobId, 'restored', actor.userId);
  return job;
}   