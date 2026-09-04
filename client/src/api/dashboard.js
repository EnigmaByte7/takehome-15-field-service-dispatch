import { apiFetch } from './client';

export function getDashboardSummary() {
  return apiFetch('/dashboard/summary');
}

export function getCompletedPerDay() {
  return apiFetch('/dashboard/completed-per-day');
}