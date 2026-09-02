import { prisma } from '../../db/client.js';
import { createEvent, listEventsForJob, findJobForVisibilityCheck } from './events.repository.js';

type Actor = { userId: string; role: 'dispatcher' | 'technician' };
type Client =  typeof prisma;

export function recordEvent(
  jobId: string,
  eventType: string,
  actorId: string,
  oldValue?: string | null,
  newValue?: string | null,
  client: Client = prisma
) {
  return createEvent(
  {
    jobId,
    eventType,
    actorId,
    ...(oldValue !== undefined && { oldValue }),
    ...(newValue !== undefined && { newValue }),
  },
  client
);
}

export async function getTimeline(actor: Actor, jobId: string) {
  const job = await findJobForVisibilityCheck(jobId);
  if (!job) return 'not_found' as const;

  if (actor.role === 'technician') {
    const isAssigned = job.assignments.some((a) => a.technicianId === actor.userId);
    if (!isAssigned) return 'forbidden' as const;
  }

  return listEventsForJob(jobId);
}

export async function addNote(actor: Actor, jobId: string, text: string) {
  const job = await findJobForVisibilityCheck(jobId);
  if (!job) return 'not_found' as const;

  if (actor.role === 'technician') {
    const isAssigned = job.assignments.some((a) => a.technicianId === actor.userId);
    if (!isAssigned) return 'forbidden' as const;
  }

  return recordEvent(jobId, 'note_added', actor.userId, null, text);
}