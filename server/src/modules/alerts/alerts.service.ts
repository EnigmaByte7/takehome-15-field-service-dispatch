import * as repo from './alerts.repository.js';
import { getWindow } from '../../lib/dateOverlap.js';

type LatestAlert = Awaited<ReturnType<typeof repo.findLatestAlertsForJobs>>[number];

async function syncAlerts() {
  const jobs = await repo.findAllJobsForAlertCheck();
  const now = new Date();

  const alerts = await repo.findLatestAlertsForJobs(jobs.map((j) => j.id));
  const latestByJob = new Map<string, LatestAlert>();
  for (const alert of alerts) {
    if (!latestByJob.has(alert.jobId)) latestByJob.set(alert.jobId, alert);
  }

  const toCreate: { jobId: string; windowEnd: Date; reappearedFromId: string | null }[] = [];
  const toResolve: string[] = [];

  for (const job of jobs) {
    const { end } = getWindow(job.scheduledDate, job.startTime, job.estimatedDurationMinutes);
    const isLate = job.status !== 'completed' && !job.archivedAt && end < now;
    const latest = latestByJob.get(job.id);

    if (isLate) {
      if (!latest) {
        toCreate.push({ jobId: job.id, windowEnd: end, reappearedFromId: null });
      } else if (latest.dismissedAt === null) {
      } else if (latest.windowEnd.getTime() !== end.getTime()) {
        toCreate.push({ jobId: job.id, windowEnd: end, reappearedFromId: latest.id });
      }
    } else if (latest && latest.dismissedAt === null) {
      toResolve.push(latest.id);
    }
  }

  for (const data of toCreate) {
    await repo.createAlert(data);
  }
  if (toResolve.length > 0) {
    await repo.dismissAlertsByIds(toResolve);
  }
}

export async function listAlerts() {
  await syncAlerts();
  return repo.findActiveAlertsWithJob();
}

export async function getAlertCount() {
  await syncAlerts();
  return repo.countActiveAlerts();
}

export async function dismissAlert(alertId: string) {
  const alert = await repo.findAlertById(alertId);
  if (!alert) return 'not_found' as const;
  if (alert.dismissedAt) return 'already_dismissed' as const;
  await repo.dismissAlert(alertId);
  return { success: true } as const;
}