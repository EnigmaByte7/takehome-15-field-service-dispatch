import { prisma } from '../../db/client.js';
import * as repo from './assignments.repository.js';
import { getWindow, windowsOverlap } from '../../lib/dateOverlap.js';
import { recordEvent } from '../events/events.service.js';

type Actor = { userId: string; role: 'dispatcher' | 'technician' };
type Result = { success: true } | { success: false; reason: string };

const OVERLAP_MESSAGE = 'Technician is already booked on another job during this window';


function isOverlapConstraintError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : '';
  return message.includes('23P01') || message.includes('no_overlapping_assignments');
  // this error is raised when the exclude constraint detects a overlapping assignemnt, this error is raised by the prisma itself..
}

export async function assignTechnician(
  actor: Actor,
  jobId: string,
  technicianId: string
): Promise<Result> {
  try {
    return await prisma.$transaction(async (tx) => {
      const job = await repo.findJobForAssignment(jobId, tx);
      if (!job) return { success: false, reason: 'Job not found' };
      if (job.archivedAt) return { success: false, reason: 'Cannot assign an archived job' };

      const newWindow = getWindow(job.scheduledDate, job.startTime, job.estimatedDurationMinutes);
      const others = await repo.findActiveAssignmentsForTechnician(technicianId, jobId, tx);

      const conflict = others.find((a) =>
        windowsOverlap(newWindow.start, newWindow.end, a.windowStart, a.windowEnd)
      );
      if (conflict) return { success: false, reason: OVERLAP_MESSAGE };

      await repo.createAssignment(
        { jobId, technicianId, windowStart: newWindow.start, windowEnd: newWindow.end },
        tx
      );

      if (job.status === 'unassigned') {
        await repo.updateJobStatus(jobId, 'assigned', tx);
      }

      await recordEvent(jobId, 'assigned', actor.userId, null, technicianId, tx);
      return { success: true };
    });
  } catch (err) {
    if (isOverlapConstraintError(err)) return { success: false, reason: OVERLAP_MESSAGE };
    throw err;
  }
}

export async function bulkAssign(actor: Actor, jobIds: string[], technicianId: string) {
  const results: { jobId: string; success: boolean; reason?: string }[] = [];
 
  for (const jobId of jobIds) {
    const result = await assignTechnician(actor, jobId, technicianId);
    results.push(
      result.success
        ? { jobId, success: true }
        : { jobId, success: false, reason: result.reason }
    );
  }
 
  return results;
}

export async function unassignTechnician(
  actor: Actor,
  jobId: string,
  technicianId: string
): Promise<Result> {
  return prisma.$transaction(async (tx) => {
    await repo.removeAssignment(jobId, technicianId, tx);
    await recordEvent(jobId, 'unassigned', actor.userId, technicianId, null, tx);
    return { success: true };
  });
}
