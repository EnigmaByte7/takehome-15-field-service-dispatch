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

export interface JobListFilters {
  search?: string | undefined;
  status?: 'unassigned' | 'assigned' | 'en_route' | 'on_site' | 'completed' | undefined;
  technicianId?: string | undefined;
  date?: string | undefined; // 'YYYY-MM-DD'
  sortBy?: 'scheduledDate' | 'priority' | 'status' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  includeArchived?: boolean | undefined;
}
 

export async function listJobs(actor: Actor, filters: JobListFilters) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;

  const where: any = {
    archivedAt: filters.includeArchived ? undefined : null,
  };

  if (actor.role === 'technician') {
    where.assignments = { some: { technicianId: actor.userId, removedAt: null } };
  } else if (filters.technicianId) {
    where.assignments = { some: { technicianId: filters.technicianId, removedAt: null } };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.date) {
    where.scheduledDate = new Date(filters.date);
  }

  if (filters.search) {
    where.OR = [
      { customerName: { contains: filters.search, mode: 'insensitive' } },
      { siteAddress: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const sortBy = filters.sortBy ?? 'scheduledDate';
  const sortOrder = filters.sortOrder ?? 'asc';
  const orderBy = { [sortBy]: sortOrder };

  const [jobs, total] = await Promise.all([
    jobsRepo.findJobs(where, orderBy, (page - 1) * pageSize, pageSize),
    jobsRepo.countJobs(where),
  ]);

  return { jobs, total, page, pageSize };
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