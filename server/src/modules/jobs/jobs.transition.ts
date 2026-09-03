export type JobStatus = 'unassigned' | 'assigned' | 'en_route' | 'on_site' | 'completed';

// a set of rules to define legal job state transitions
const ALLOWED_TRANSITIONS: Record<string, JobStatus[]> = {
  assigned: ['en_route'],
  en_route: ['on_site'],
  on_site: ['completed'],
};

export function isLegalTransition(current: JobStatus, next: JobStatus): boolean {
  return (ALLOWED_TRANSITIONS[current] ?? []).includes(next);
}