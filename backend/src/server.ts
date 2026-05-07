import 'reflect-metadata';
import dotenv from 'dotenv';
import { createApp, initializeDatabase } from './index.js';

dotenv.config();

const PORT = process.env.BACKEND_PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initializeDatabase();

    // Create Express app
    const app = createApp();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 ClinicPRO API running on http://localhost:${PORT}`);
      console.log(`📚 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('💥 Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
