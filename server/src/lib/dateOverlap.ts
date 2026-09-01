export function combineDateAndTime(date: Date, time: Date): Date {
  const combined = new Date(date);
  combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
  return combined;
}

export function getWindow(scheduledDate: Date, startTime: Date, durationMinutes: number) {
  const start = combineDateAndTime(scheduledDate, startTime);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  return { start, end };
}

export function windowsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

//reusable fiunction to check for overlapping job assignments