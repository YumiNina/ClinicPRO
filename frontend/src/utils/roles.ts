import type { UserRole } from '../types/auth';

export const getDefaultPathForRole = (role?: UserRole | string | null) => {
  if (role === 'medico') return '/doctor';
  if (role === 'recepcionista') return '/reception';
  if (role === 'admin') return '/admin';
  return '/';
};

export const normalizeRouteRole = (role: 'admin' | 'doctor' | 'reception'): UserRole => {
  if (role === 'doctor') return 'medico';
  if (role === 'reception') return 'recepcionista';
  return role;
};
