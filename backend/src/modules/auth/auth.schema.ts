import { z } from 'zod';

const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const registerSchema = z.object({
  nombre_completo: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener mínimo 3 caracteres')
    .max(150, 'El nombre es demasiado largo')
    .regex(nameRegex, 'El nombre solo puede contener letras y espacios'),

  email: z
    .string()
    .trim()
    .email('Correo electrónico inválido')
    .max(100, 'El correo es demasiado largo'),

  password: z
    .string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .regex(
      passwordRegex,
      'La contraseña debe tener mayúscula, minúscula, número y carácter especial'
    ),

  rol: z.enum(['admin', 'medico', 'recepcionista']),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const googleSessionSchema = z.object({
  supabaseAccessToken: z.string().min(1, 'Token de Google requerido'),
});

export const googleReceptionistRegisterSchema = z.object({
  supabaseAccessToken: z.string().min(1, 'Token de Google requerido'),
  nombre_completo: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener mínimo 3 caracteres')
    .max(150, 'El nombre es demasiado largo')
    .regex(nameRegex, 'El nombre solo puede contener letras y espacios'),
});
