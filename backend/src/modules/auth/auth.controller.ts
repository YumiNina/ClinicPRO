import { Request, Response } from 'express';
import { z } from 'zod';

import {
  loginSchema,
  registerSchema,
  recoverPasswordSchema,
} from './auth.schema';

import { authService } from './auth.service';

type ZodIssue = z.ZodIssue;

export const login = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validación fallida',
        errors: validation.error.issues.map((e: ZodIssue) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const { email, password } = validation.data;

    const authData = await authService.validateUserCredentials(
      email,
      password
    );

    return res.status(200).json({
      success: true,
      message: 'Bienvenido al sistema',
      data: authData,
    });
  } catch (error: unknown) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales incorrectas',
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validación fallida',
      });
    }

    const { name, email, password, phone } = validation.data;

    const user = await authService.registerUser(
      name,
      email,
      password,
      phone
    );

    return res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
    });
  }
};

export const logout = async (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Sesión cerrada',
  });
};

export const recoverPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const validation = recoverPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validación fallida',
      });
    }

    const { email } = validation.data;

    await authService.recoverPassword(email);

    return res.status(200).json({
      success: true,
      message: 'Correo enviado',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error recuperando contraseña',
    });
  }
};

export const getProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
    }

    const profile = await authService.getProfile(user.id);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error obteniendo perfil',
    });
  }
};