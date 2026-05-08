import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    rol: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
      });
    }

    const token = authHeader.split(' ')[1];

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'JWT secret no configurado',
      });
    }

    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      rol: string;
    };

    req.user = decoded;

    next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
};