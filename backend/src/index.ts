import 'reflect-metadata';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Express, type Request, type Response } from 'express';
import { authRoutes } from './modules/auth/index.js';
import { AppDataSource } from './config/database.js';
import { authMiddleware } from "./middleware/auth.middleware";

dotenv.config();

export const createApp = (): Express => {
  const app = express();

  // CORS Configuration
  app.use(
    cors({
      origin: [
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:3000',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'ClinicPRO API',
      timestamp: new Date().toISOString(),
    });
  });

  // Auth routes (public)
  app.use('/api/auth', authRoutes);

  // Protected routes
  app.use('/api/citas', authMiddleware);

  return app;
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};
