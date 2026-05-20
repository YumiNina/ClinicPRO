import { describe, expect, it } from 'vitest';
import { getDefaultPathForRole, normalizeRouteRole } from './roles';

describe('role routing helpers', () => {
  it('returns the admin dashboard path for admin users', () => {
    expect(getDefaultPathForRole('admin')).toBe('/admin');
  });

  it('returns the doctor dashboard path for medico users', () => {
    expect(getDefaultPathForRole('medico')).toBe('/doctor');
  });

  it('returns the reception dashboard path for recepcionista users', () => {
    expect(getDefaultPathForRole('recepcionista')).toBe('/reception');
  });

  it('falls back to login for unknown or missing roles', () => {
    expect(getDefaultPathForRole(undefined)).toBe('/');
    expect(getDefaultPathForRole('patient')).toBe('/');
  });

  it('normalizes route names to persisted roles', () => {
    expect(normalizeRouteRole('doctor')).toBe('medico');
    expect(normalizeRouteRole('admin')).toBe('admin');
  });
});
