import { prisma } from '../../db/client.js'

export function createEvent(data: {
  jobId: string;
  eventType: string;
  oldValue?: string | null;
  newValue?: string | null;
actorId: string;
}) {
  return prisma.jobEvent.create({ data });
}

export function listEventsForJob(jobId: string) {
  return prisma.jobEvent.findMany({
    where: { jobId },
    orderBy: { createdAt: 'asc' },
  });
}