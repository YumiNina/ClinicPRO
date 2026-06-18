import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { recordAuthFailure } from '../utils/metrics';

export interface AuthRequest extends Request {
  requestId?: string;
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
      recordAuthFailure('missing_bearer_token');
      logger.warn('auth.failure', {
        requestId: req.requestId,
        method: req.method,
        route: req.originalUrl,
        reason: 'missing_bearer_token',
      });

      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
        requestId: req.requestId,
      });
    }

    const token = authHeader.split(' ')[1];

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      logger.error('auth.configuration_error', {
        requestId: req.requestId,
        method: req.method,
        route: req.originalUrl,
        reason: 'missing_jwt_secret',
      });

      return res.status(500).json({
        success: false,
        message: 'JWT secret no configurado',
        requestId: req.requestId,
      });
    }

    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      rol: string;
    };

    req.user = decoded;

    next();
  } catch (error) {
    const reason =
      error instanceof jwt.TokenExpiredError ? 'expired_token' : 'invalid_token';

    recordAuthFailure(reason);
    logger.warn('auth.failure', {
      requestId: req.requestId,
      method: req.method,
      route: req.originalUrl,
      reason,
      error,
    });

    return res.status(401).json({
      success: false,
      message: 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.',
      requestId: req.requestId,
    });
  }
};
