import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

type RequestWithContext = Request & {
  requestId?: string;
  user?: {
    id: string;
  };
};

export const notFoundHandler = (
  req: RequestWithContext,
  res: Response,
  _next: NextFunction,
) => {
  logger.warn('http.route.not_found', {
    requestId: req.requestId,
    method: req.method,
    route: req.originalUrl,
    statusCode: 404,
    userId: req.user?.id,
  });

  return res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    requestId: req.requestId,
  });
};

export const errorHandler: ErrorRequestHandler = (
  error,
  req: RequestWithContext,
  res: Response,
  _next,
) => {
  const statusCode =
    typeof error.status === 'number' && error.status >= 400 && error.status < 600
      ? error.status
      : 500;

  logger.error('http.error.unhandled', {
    requestId: req.requestId,
    method: req.method,
    route: req.originalUrl,
    statusCode,
    userId: req.user?.id,
    error,
  });

  if (res.headersSent) return;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? 'Error interno del servidor'
        : error.message || 'Solicitud no procesada',
    requestId: req.requestId,
  });
};
