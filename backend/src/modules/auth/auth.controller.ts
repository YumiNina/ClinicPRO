import { Request, Response } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware';

import {
  googleReceptionistRegisterSchema,
  googleSessionSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
} from './auth.schema';

import { authService } from './auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: validation.error.flatten(),
      });
    }

    const user = await authService.register(validation.data);

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario registrado con ese correo.',
        field: 'email',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'No se pudo registrar usuario',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
      });
    }

    const data = await authService.login(
      validation.data.email,
      validation.data.password
    );

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data,
    });
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Email o contraseña incorrectos',
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const validation = refreshSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requerido',
      });
    }

    const data = await authService.refresh(validation.data.refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Tokens renovados correctamente',
      data,
    });
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token inválido o expirado',
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const validation = refreshSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requerido',
      });
    }

    await authService.logout(validation.data.refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Sesión cerrada correctamente',
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
    });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
    }

    const profile = await authService.getProfile(userId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
    });
  }
};

export const googleLoginUrl = async (_req: Request, res: Response) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';

  if (!supabaseUrl) {
    return res.status(500).json({
      success: false,
      message: 'Supabase URL no configurada',
    });
  }

  const redirectTo = `${frontendUrl}/`;
  const url = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(
    redirectTo,
  )}`;

  return res.json({
    success: true,
    data: { url },
  });
};

export const googleSession = async (req: Request, res: Response) => {
  try {
    const validation = googleSessionSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Token de Google requerido',
      });
    }

    const data = await authService.googleSession(
      validation.data.supabaseAccessToken
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'No se pudo validar tu cuenta de Gmail',
    });
  }
};

export const registerGoogleReceptionist = async (
  req: Request,
  res: Response
) => {
  try {
    const validation = googleReceptionistRegisterSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: validation.error.flatten(),
      });
    }

    const data = await authService.registerGoogleReceptionist(
      validation.data.supabaseAccessToken,
      validation.data.nombre_completo
    );

    return res.status(201).json({
      success: true,
      message: 'Recepcionista registrada correctamente',
      data,
    });
  } catch (_error) {
    return res.status(400).json({
      success: false,
      message: 'No se pudo registrar la cuenta de recepción',
    });
  }
};
