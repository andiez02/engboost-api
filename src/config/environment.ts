import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_HOST: process.env.APP_HOST || 'localhost',
  APP_PORT: parseInt(process.env.APP_PORT || '5000', 10),

  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_USER: process.env.DB_USER || 'engboost',
  DB_PASSWORD: process.env.DB_PASSWORD || 'engboost123',
  DB_NAME: process.env.DB_NAME || 'engboost_db',

  // JWT
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'default_access_secret',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret',
  ACCESS_TOKEN_LIFE: '1h',    // 1 hour
  REFRESH_TOKEN_LIFE: '15d',  // 15 days

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Brevo (Email)
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  ADMIN_EMAIL_ADDRESS: process.env.ADMIN_EMAIL_ADDRESS || '',
  ADMIN_EMAIL_NAME: process.env.ADMIN_EMAIL_NAME || '',

  // Frontend
  WEBSITE_DOMAIN: process.env.WEBSITE_DOMAIN || 'http://localhost:5173',

  // AI Microservice
  AI_MICROSERVICE_URL: process.env.AI_MICROSERVICE_URL || 'http://localhost:5001',
};

export const isProduction = env.NODE_ENV === 'production';
