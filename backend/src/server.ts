import 'reflect-metadata';

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authMiddleware } from './middleware/auth.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import {
  requestIdMiddleware,
  requestLoggingMiddleware,
} from './middleware/observability.middleware';
import { securityHeadersMiddleware } from './middleware/security.middleware';
import { authRoutes } from './modules/auth';
import dataRoutes from './modules/data/data.routes';
import { getLogEnvironment, logger } from './utils/logger';
import { renderPrometheusMetrics } from './utils/metrics';

const app = express();

const defaultAllowedOrigins =
  process.env.NODE_ENV === 'production'
    ? []
    : [
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:3000',
      ];

const configuredAllowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  process.env.FRONTEND_URL ||
  ''
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...configuredAllowedOrigins,
]);

app.use(requestIdMiddleware);
app.use(securityHeadersMiddleware);
app.use(requestLoggingMiddleware);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    exposedHeaders: ['x-request-id'],
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => {
  return res.json({
    success: true,
    message: 'CLINIC PRO API RUNNING',
  });
});

app.get('/api/health', (_req, res) => {
  return res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: getLogEnvironment(),
  });
});

app.get('/api/metrics', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  return res.send(renderPrometheusMetrics());
});

const PORT = process.env.PORT || 3001;

app.use('/api/auth', authRoutes);
app.use('/api', authMiddleware, dataRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
app.listen(PORT, () => {
  logger.info('application.started', {
    port: PORT,
    allowedOrigins: Array.from(allowedOrigins),
  });
});

process.on('unhandledRejection', (error) => {
  logger.error('process.unhandled_rejection', { error });
});

process.on('uncaughtException', (error) => {
  logger.error('process.uncaught_exception', { error });
  process.exit(1);
});
