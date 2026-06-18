import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { logger } from '../utils/logger';
import { recordAuthFailure } from '../utils/metrics';

export const authorizeRoles = (...roles: string[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      recordAuthFailure('missing_authenticated_user');
      logger.warn('authorization.failure', {
        requestId: req.requestId,
        method: req.method,
        route: req.originalUrl,
        reason: 'missing_authenticated_user',
      });

      return res.status(401).json({
        success: false,
        message: 'No autenticado',
        requestId: req.requestId,
      });
    }

    if (!roles.includes(req.user.rol)) {
      recordAuthFailure('role_not_allowed');
      logger.warn('authorization.failure', {
        requestId: req.requestId,
        method: req.method,
        route: req.originalUrl,
        userId: req.user.id,
        userRole: req.user.rol,
        allowedRoles: roles,
        reason: 'role_not_allowed',
      });

      return res.status(403).json({
        success: false,
        message: 'No autorizado',
        requestId: req.requestId,
      });
    }

    next();
  };
};
