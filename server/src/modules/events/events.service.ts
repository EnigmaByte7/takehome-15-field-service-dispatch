import { createEvent, listEventsForJob } from '../events/events.repository.js';

export function recordEvent(
  jobId: string,
  eventType: string,
  actorId: string,
  oldValue?: string | null,
  newValue?: string | null
) {
  return createEvent({
    jobId,
    eventType,
    actorId,
    ...(oldValue !== undefined && { oldValue }),
    ...(newValue !== undefined && { newValue }),
  });
}

export function getTimeline(jobId: string) {
  return listEventsForJob(jobId);
}