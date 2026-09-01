import * as partsRepo from './parts.repository.js';

type Actor = { userId: string; role: 'dispatcher' | 'technician' };

export async function addPart(
  actor: Actor,
  jobId: string,
  partName: string,
  quantity: number
) {
  const job = await partsRepo.findJobForCheck(jobId);
  if (!job) return 'not_found' as const;

  if (actor.role === 'technician') {
    const isAssigned = job.assignments.some((a) => a.technicianId === actor.userId);
    if (!isAssigned) return 'forbidden' as const;
  }

  if (job.status === 'completed') {
    return 'job_completed' as const;
  }

  return partsRepo.createPart({
    jobId,
    partName,
    quantity,
    recordedById: actor.userId,
  });
}