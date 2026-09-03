import { prisma}from '../../db/client.js';
import { Prisma } from '../../generated/prisma/client.js';

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

export function findJobs(
  where: Prisma.JobWhereInput,
  orderBy: Prisma.JobOrderByWithRelationInput,
  skip: number,
  take: number
) {
  return prisma.job.findMany({
    where,
    orderBy,
    skip,
    take,
    include: {
      assignments: { where: { removedAt: null }, include: { technician: true } },
    },
  });
}

export function countJobs(where: Prisma.JobWhereInput) {
  return prisma.job.count({ where });
}

export function findJobsByDate(date: Date) {
  return prisma.job.findMany({
    where: { scheduledDate: date, archivedAt: null },
    include: {
      assignments: { where: { removedAt: null }, include: { technician: true } },
    },
    orderBy: { startTime: 'asc' },
  });
}