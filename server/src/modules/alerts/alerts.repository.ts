import { prisma } from '../../db/client.js';

export function findAllJobsForAlertCheck() {
  return prisma.job.findMany({
    select: {
      id: true,
      status: true,
      archivedAt: true,
      scheduledDate: true,
      startTime: true,
      estimatedDurationMinutes: true,
    },
  });
}

export function findLatestAlertsForJobs(jobIds: string[]) {
  return prisma.alert.findMany({
    where: { jobId: { in: jobIds } },
    orderBy: { createdAt: 'desc' },
  });
}

export function createAlert(data: { jobId: string; windowEnd: Date; reappearedFromId: string | null }) {
  return prisma.alert.create({ data });
}

export function dismissAlertsByIds(ids: string[]) {
  return prisma.alert.updateMany({
    where: { id: { in: ids } },
    data: { dismissedAt: new Date() },
  });
}

export function findActiveAlertsWithJob() {
  return prisma.alert.findMany({
    where: { dismissedAt: null },
    include: { job: true },
    orderBy: { createdAt: 'desc' },
  });
}

export function countActiveAlerts() {
  return prisma.alert.count({ where: { dismissedAt: null } });
}

export function findAlertById(id: string) {
  return prisma.alert.findUnique({ where: { id } });
}

export function dismissAlert(id: string) {
  return prisma.alert.update({ where: { id }, data: { dismissedAt: new Date() } });
}