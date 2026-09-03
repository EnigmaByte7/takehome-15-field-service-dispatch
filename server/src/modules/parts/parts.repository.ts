import { prisma } from '../../db/client.js';
import { Prisma } from '../../generated/prisma/client.js';

type Client = Prisma.TransactionClient | typeof prisma;

export function createPart(data: {
  jobId: string;
  partName: string;
  quantity: number;
  recordedById: string;
}) {
  return prisma.partUsed.create({ data });
}

export function countPartsForJob(jobId: string, client: Client = prisma) {
  return client.partUsed.count({ where: { jobId } });
}

export function findJobForCheck(jobId: string) {
  return prisma.job.findUnique({
    where: { id: jobId },
    include: {
      assignments: { where: { removedAt: null } },
    },
  });
}