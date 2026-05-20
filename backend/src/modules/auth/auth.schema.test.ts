import { describe, expect, it } from 'vitest';
import {
  googleReceptionistRegisterSchema,
  googleSessionSchema,
  loginSchema,
  registerSchema,
} from './auth.schema';

describe('auth schemas', () => {
  it('accepts a valid receptionist registration payload', () => {
    const result = registerSchema.safeParse({
      nombre_completo: 'Recepcion Clinic Pro',
      email: 'recepcion@clinicpro.test',
      password: 'Prueba2026!',
      rol: 'recepcionista',
    });

    expect(result.success).toBe(true);
  });

  it('rejects unsupported roles such as patient', () => {
    const result = registerSchema.safeParse({
      nombre_completo: 'Paciente Demo',
      email: 'paciente@clinicpro.test',
      password: 'Prueba2026!',
      rol: 'patient',
    });

    expect(result.success).toBe(false);
  });

  it('rejects weak passwords without a special character', () => {
    const result = registerSchema.safeParse({
      nombre_completo: 'Admin Clinic Pro',
      email: 'admin@clinicpro.test',
      password: 'Prueba2026',
      rol: 'admin',
    });

    expect(result.success).toBe(false);
  });

  it('rejects names with numbers during registration', () => {
    const result = registerSchema.safeParse({
      nombre_completo: 'Doctor 123',
      email: 'doctor@clinicpro.test',
      password: 'Prueba2026!',
      rol: 'medico',
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid login credentials and rejects invalid email format', () => {
    expect(
      loginSchema.safeParse({
        email: 'admin@clinicpro.test',
        password: 'Prueba2026!',
      }).success,
    ).toBe(true);

    expect(
      loginSchema.safeParse({
        email: 'admin clinicpro.test',
        password: 'Prueba2026!',
      }).success,
    ).toBe(false);
  });

  it('requires a Google token before creating a Google session', () => {
    expect(googleSessionSchema.safeParse({ supabaseAccessToken: 'token' }).success).toBe(true);
    expect(googleSessionSchema.safeParse({ supabaseAccessToken: '' }).success).toBe(false);
  });

  it('accepts a valid Google receptionist registration payload', () => {
    const result = googleReceptionistRegisterSchema.safeParse({
      supabaseAccessToken: 'google-token',
      nombre_completo: 'Lucia Recepcion',
    });

    expect(result.success).toBe(true);
  });
});
