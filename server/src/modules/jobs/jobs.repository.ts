import { prisma } from '../../db/client.js';

export function createJob(data: {
  customerName: string;
  siteAddress: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: Date;
  startTime: Date;
  estimatedDurationMinutes: number;
}) {
  return prisma.job.create({ data });
}

export function findJobById(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      assignments: { where: { removedAt: null }, include: { technician: true } },
      partsUsed: true,
    },
  });
}

export function findAssignmentForTechnician(jobId: string, technicianId: string) {
  return prisma.assignment.findFirst({
    where: { jobId, technicianId, removedAt: null },
  });
}

export function updateJobDetails(
  id: string,
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
  return prisma.job.update({ where: { id }, data });
}

export function setArchived(id: string, archivedAt: Date | null) {
  return prisma.job.update({ where: { id }, data: { archivedAt } });
}

export function listAllJobs(includeArchived: boolean) {
  return prisma.job.findMany({
    where: includeArchived ? {} : { archivedAt: null },
    include: {
      assignments: { where: { removedAt: null }, include: { technician: true } },
    },
    orderBy: { scheduledDate: 'asc' },
  });
}

export function listJobsForTechnician(technicianId: string) {
  return prisma.job.findMany({
    where: {
      assignments: { some: { technicianId, removedAt: null } },
    },
    include: {
      assignments: { where: { removedAt: null }, include: { technician: true } },
    },
    orderBy: { scheduledDate: 'asc' },
  });
}