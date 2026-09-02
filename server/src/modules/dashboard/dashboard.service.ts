import * as repo from './dashboard.repository.js';
import { getWindow } from '../../lib/dateOverlap.js';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function getSummary() {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const [scheduledToday, completedToday, unassigned, activeJobs, byStatusRows, assignments] =
    await Promise.all([
      repo.countJobsByDate(today),
      repo.countCompletedEventsBetween(today, tomorrow),
      repo.countUnassigned(),
      repo.findActiveJobWindows(),
      repo.countByStatus(),
      repo.findActiveAssignmentsWithTechnician(),
    ]);

    
  const now = new Date();
  const lateCount = activeJobs.filter((job) => {
    const { end } = getWindow(job.scheduledDate, job.startTime, job.estimatedDurationMinutes);
    return end < now;
  }).length;

  const byStatus: Record<string, number> = {};
  for (const row of byStatusRows) {
    byStatus[row.status] = row._count._all;
  }

  const byTechnician: Record<string, { email: string; count: number }> = {};
  for (const a of assignments) {
    if (!byTechnician[a.technicianId]) {
      byTechnician[a.technicianId] = { email: a.technician.email, count: 0 };
    }
    byTechnician[a.technicianId]!.count += 1;
  }

  return {
    scheduledToday,
    completedToday,
    lateCount,
    unassigned,
    byStatus,
    byTechnician: Object.values(byTechnician),
  };
}

export async function getCompletedPerDay() {
  const since = startOfDay(new Date());
  since.setDate(since.getDate() - 13); 

  const rows = await repo.completedPerDayRaw(since);
  const result: { date: string; count: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const day = new Date(since);
    day.setDate(day.getDate() + i);
    const dayStr = day.toISOString().slice(0, 10);
    const match = rows.find((r) => r.day.toISOString().slice(0, 10) === dayStr);
    result.push({ date: dayStr, count: match ? Number(match.count) : 0 });
  }

  return result;
}