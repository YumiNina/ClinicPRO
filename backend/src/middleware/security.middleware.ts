import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

type SecurityRequest = Request & {
  requestId?: string;
  user?: {
    id: string;
    rol: string;
  };
};

type RateLimitOptions = {
  windowMs: number;
  max: number;
  name: string;
};

const buckets = new Map<string, { count: number; resetAt: number }>();
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

const getClientKey = (req: Request) =>
  String(req.ip || req.socket.remoteAddress || 'unknown');

export const securityHeadersMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "form-action 'self'",
    ].join('; '),
  );

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }

  next();
};

export const createRateLimitMiddleware = ({ windowMs, max, name }: RateLimitOptions) => {
  return (req: SecurityRequest, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${name}:${getClientKey(req)}:${req.method}:${req.path}`;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfterSeconds));

    if (bucket.count > max) {
      logger.warn('security.rate_limit_exceeded', {
        requestId: req.requestId,
        method: req.method,
        route: req.originalUrl,
        limitName: name,
        retryAfterSeconds,
        userId: req.user?.id,
      });

      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.',
        requestId: req.requestId,
      });
    }

    return next();
  };
};

export const validateUuidParam = (paramName = 'id') => {
  return (req: SecurityRequest, res: Response, next: NextFunction) => {
    const value = req.params[paramName];

    if (!uuidRegex.test(String(value || ''))) {
      logger.warn('security.invalid_route_param', {
        requestId: req.requestId,
        method: req.method,
        route: req.originalUrl,
        paramName,
        userId: req.user?.id,
      });

      return res.status(400).json({
        success: false,
        message: 'Identificador inválido',
        requestId: req.requestId,
      });
    }

    return next();
  };
};
