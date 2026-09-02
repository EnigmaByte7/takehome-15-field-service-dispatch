import { prisma } from '../../db/client.js';

export function createEvent(data: {
  jobId: string;
  eventType: string;
  oldValue?: string | null;
  newValue?: string | null;
  actorId: string;
}, client = prisma) {
  return client.jobEvent.create({ data });
}

export function listEventsForJob(jobId: string) {
  return prisma.jobEvent.findMany({
    where: { jobId },
    orderBy: { createdAt: 'asc' },
    include: { actor: { select: { email: true, role: true } } },
  });
}

export function findJobForVisibilityCheck(jobId: string) {
  return prisma.job.findUnique({
    where: { id: jobId },
    include: { assignments: { where: { removedAt: null } } },
  });
}