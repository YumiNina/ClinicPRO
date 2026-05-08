import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const authorizeRoles = (...roles: string[]) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado',
      });
    }

    next();
  };
};