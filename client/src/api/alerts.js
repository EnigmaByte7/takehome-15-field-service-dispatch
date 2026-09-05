import { apiFetch } from './client';

export function getAlerts() {
  return apiFetch('/alerts');
}

export function getAlertCount() {
  return apiFetch('/alerts/count');
}

export function dismissAlert(alertId) {
  return apiFetch(`/alerts/${alertId}/dismiss`, { method: 'POST' });
}