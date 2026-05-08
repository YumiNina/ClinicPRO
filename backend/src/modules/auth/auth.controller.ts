import { Request, Response } from 'express';

import {
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
  } catch (_error) {
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

export const me = async (req: Request, res: Response) => {
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