import { apiFetch } from './client';

export function getJobs(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/jobs?${query}`);
}

export function getJob(id) {
  return apiFetch(`/jobs/${id}`);
}

export function createJob(data) {
  return apiFetch('/jobs', { method: 'POST', body: JSON.stringify(data) });
}

export function assignTechnician(jobId, technicianId) {
  return apiFetch(`/jobs/${jobId}/assignments`, {
    method: 'POST',
    body: JSON.stringify({ technicianId }),
  });
}

export function transitionStatus(jobId, status, completionNote) {
  return apiFetch(`/jobs/${jobId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, completionNote }),
  });
}

export function addPart(jobId, partName, quantity) {
  return apiFetch(`/jobs/${jobId}/parts`, {
    method: 'POST',
    body: JSON.stringify({ partName, quantity }),
  });
}

export function getTimeline(jobId) {
  return apiFetch(`/jobs/${jobId}/events`);
}

export function exportDaySheet(date) {
  return apiFetch(`/jobs/export?date=${encodeURIComponent(date)}`);
}

export function bulkAssignJobs(jobIds, technicianId) {
  return apiFetch('/jobs/bulk-assign', {
    method: 'POST',
    body: JSON.stringify({ jobIds, technicianId }),
  });
}

export function updateJob(jobId, data) {
  return apiFetch(`/jobs/${jobId}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function archiveJob(jobId) {
  return apiFetch(`/jobs/${jobId}/archive`, { method: 'POST' });
}

export function restoreJob(jobId) {
  return apiFetch(`/jobs/${jobId}/restore`, { method: 'POST' });
}

export function unassignTechnician(jobId, technicianId) {
  return apiFetch(`/jobs/${jobId}/assignments`, {
    method: 'DELETE',
    body: JSON.stringify({ technicianId }),
  });
}