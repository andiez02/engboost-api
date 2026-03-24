import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env, isProduction } from './config/environment';
import { corsOptions } from './config/cors';
import { errorHandler } from './middlewares/errorHandler';
import sequelize from './config/sequelize';

// Import models to register associations
import './models';

// Import routes
import userRoutes from './modules/user/user.route';
import folderRoutes from './modules/folder/folder.route';
import flashcardRoutes from './modules/flashcard/flashcard.route';
import courseRoutes from './modules/course/course.route';
import snaplangRoutes from './modules/snaplang/snaplang.route';

const app = express();

// ==================== Middlewares ====================
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Disable cache headers
app.use((_req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0',
    Pragma: 'no-cache',
    Expires: '0',
  });
  next();
});

// ==================== Routes ====================
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to EngBoost API (Express + PostgreSQL)',
    environment: isProduction ? 'production' : 'development',
  });
});

app.use('/api/users', userRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/snaplang', snaplangRoutes);

// ==================== Error Handler  ====================
app.use(errorHandler);

// ==================== Start Server ====================
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully!');

    // Sync models in development (create tables if not exist)
    if (!isProduction) {
      await sequelize.sync({ alter: false });
      console.log('✅ Database models synced.');
    }

    const host = isProduction ? '0.0.0.0' : env.APP_HOST;
    const port = isProduction ? parseInt(process.env.PORT || '10000', 10) : env.APP_PORT;

    app.listen(port, host, () => {
      console.log(`🚀 Server running at http://${host}:${port}`);
      console.log(`📦 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await sequelize.close();
  console.log('🛑 PostgreSQL connection closed.');
  process.exit(0);
});

export default app;
