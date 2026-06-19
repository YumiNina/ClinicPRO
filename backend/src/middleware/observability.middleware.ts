import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { recordHttpRequest } from '../utils/metrics';

type ObservableRequest = Request & {
  requestId?: string;
  user?: {
    id: string;
    email: string;
    rol: string;
  };
};

const getRequestIdFromHeader = (req: Request) => {
  const header = req.headers['x-request-id'];

  if (Array.isArray(header)) {
    return header[0];
  }

  return header;
};

const getRouteLabel = (req: Request) => {
  const routePath = req.route?.path;
  const baseUrl = req.baseUrl || '';

  if (typeof routePath === 'string') {
    return `${baseUrl}${routePath}` || req.path;
  }

  return req.path;
};

export const requestIdMiddleware = (
  req: ObservableRequest,
  res: Response,
  next: NextFunction,
) => {
  req.requestId = getRequestIdFromHeader(req) || randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
};

export const requestLoggingMiddleware = (
  req: ObservableRequest,
  res: Response,
  next: NextFunction,
) => {
  const start = process.hrtime.bigint();
  const route = req.originalUrl.split('?')[0];

  logger.info('http.request.received', {
    requestId: req.requestId,
    method: req.method,
    route,
  });

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const routeLabel = getRouteLabel(req);
    const metadata = {
      requestId: req.requestId,
      method: req.method,
      route: routeLabel,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(3)),
      userId: req.user?.id,
    };

    recordHttpRequest({
      method: req.method,
      route: routeLabel,
      statusCode: res.statusCode,
      durationMs,
    });

    if (res.statusCode >= 500) {
      logger.error('http.request.completed', metadata);
      return;
    }

    if (res.statusCode >= 400) {
      logger.warn('http.request.completed', metadata);
      return;
    }

    logger.info('http.request.completed', metadata);
  });

  next();
};
