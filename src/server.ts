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
import studyRoutes from './modules/study/study.route';
import deckRoutes from './modules/deck/deck.route';
import postRoutes from './modules/post/post.route';
import exploreRoutes from './modules/explore/explore.route';
import adminFolderRoutes from './modules/adminFolder/adminFolder.route';
import leaderboardRouter from './modules/leaderboard/leaderboard.route';
import notificationRoutes from './modules/notification/notification.route';
import chatbotRoutes from './modules/chatbot/chatbot.route';

// Import jobs
import { startWeeklyResetJob } from './jobs/weeklyReset.job';
import { startStreakWarningJob } from './jobs/streakWarning.job';

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
app.use('/api/study', studyRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/admin/folders', adminFolderRoutes);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);

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

    // Seed achievements (upsert — safe to run every boot)
    const { achievementService } = await import('./modules/gamification/achievement.service');
    await achievementService.seedAchievements();
    console.log('✅ Achievements seeded.');

    // Seed challenges (upsert — safe to run every boot)
    const { challengeService } = await import('./modules/gamification/challenge.service');
    await challengeService.seedChallenges();
    console.log('✅ Challenges seeded.');

    const host = isProduction ? '0.0.0.0' : env.APP_HOST;
    const port = isProduction ? parseInt(process.env.PORT || '10000', 10) : env.APP_PORT;

    app.listen(port, host, () => {
      console.log(`🚀 Server running at http://${host}:${port}`);
      console.log(`📦 Environment: ${env.NODE_ENV}`);
    });

    // Start cron jobs
    startWeeklyResetJob();
    console.log('✅ Weekly reset cron job started.');
    startStreakWarningJob();
    console.log('✅ Streak warning cron job started.');
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
