import 'reflect-metadata';

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRoutes } from './modules/auth';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
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

const PORT = process.env.PORT || 3001;

app.use('/api/auth', authRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});