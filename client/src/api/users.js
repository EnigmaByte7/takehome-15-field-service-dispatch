import { apiFetch } from './client';

export function getTechnicians() {
  return apiFetch('/users/technicians');
}