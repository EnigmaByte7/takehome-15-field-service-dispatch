import {prisma } from '../../db/client.js';

export function createPart(data: {
  jobId: string;
  partName: string;
  quantity: number;
  recordedById: string;
}) {
  return prisma.partUsed.create({ data });
}

export function findJobForCheck(jobId: string) {
  return prisma.job.findUnique({
    where: { id: jobId },
    include: {
      assignments: { where: { removedAt: null } },
    },
  });
}