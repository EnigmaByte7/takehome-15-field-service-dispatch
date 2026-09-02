import { prisma } from '../../db/client.js';

export function countJobsByDate(date: Date) {
  return prisma.job.count({ where: { scheduledDate: date, archivedAt: null } });
}

export function countCompletedEventsBetween(start: Date, end: Date) {
  return prisma.jobEvent.count({
    where: { eventType: 'completed', createdAt: { gte: start, lt: end } },
  });
}

export function countUnassigned() {
  return prisma.job.count({ where: { status: 'unassigned', archivedAt: null } });
}

export function findActiveJobWindows() {
  return prisma.job.findMany({
    where: { status: { not: 'completed' }, archivedAt: null },
    select: { scheduledDate: true, startTime: true, estimatedDurationMinutes: true },
  });
}

export function countByStatus() {
  return prisma.job.groupBy({
    by: ['status'],
    where: { archivedAt: null },
    _count: { _all: true },
  });
}

export function findActiveAssignmentsWithTechnician() {
  return prisma.assignment.findMany({
    where: { removedAt: null, job: { archivedAt: null } },
    include: { technician: { select: { id: true, email: true } } },
  });
}

//this is a raw query because, we wwant to trucate teh create at timestamp into the "day", for ex 20th august 14:23 and 20th august 9:15 are essentially the same day,
//so to group by using the "day" , we haveto truncate the timestamp into day, and now prisma does not has a direct replacement for this method, so we have to use direct sql only..

export function completedPerDayRaw(sinceDate: Date) {
  return prisma.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT date_trunc('day', "createdAt") as day, count(*)::bigint as count
    FROM "JobEvent"
    WHERE "eventType" = 'completed' AND "createdAt" >= ${sinceDate}
    GROUP BY day
    ORDER BY day
  `;
}