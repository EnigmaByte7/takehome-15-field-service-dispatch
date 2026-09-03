import { prisma } from '../../db/client.js';
import { Prisma } from '../../generated/prisma/client.js';

type Client = Prisma.TransactionClient | typeof prisma;

export function findJobForAssignment(jobId: string, client: Client = prisma) {
  return client.job.findUnique({ where: { id: jobId } });
}

export function findActiveAssignmentsForTechnician(
  technicianId: string,
  excludeJobId: string,
  client: Client = prisma
) {
  return client.assignment.findMany({
    where: { technicianId, removedAt: null, jobId: { not: excludeJobId } },
  });
}

export function findActiveAssignmentsForJob(jobId: string, client: Client = prisma) {
  return client.assignment.findMany({ where: { jobId, removedAt: null } });
}

export function createAssignment(
  data: { jobId: string; technicianId: string; windowStart: Date; windowEnd: Date },
  client: Client = prisma
) {
  return client.assignment.create({ data });
}

export function removeAssignment(jobId: string, technicianId: string, client: Client = prisma) {
  return client.assignment.updateMany({
    where: { jobId, technicianId, removedAt: null },
    data: { removedAt: new Date() },
  });
}

export function updateAssignmentWindow(
  id: string,
  windowStart: Date,
  windowEnd: Date,
  client: Client = prisma
) {
  return client.assignment.update({ where: { id }, data: { windowStart, windowEnd } });
}

export function updateJobStatus(jobId: string, status: 'assigned', client: Client = prisma) {
  return client.job.update({ where: { id: jobId }, data: { status } });
}