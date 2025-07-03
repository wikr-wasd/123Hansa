import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'staging', 'production']).default('development'),
  port: z.coerce.number().default(3001),
  
  // Database
  databaseUrl: z.string().min(1),
  
  // Redis
  redisUrl: z.string().optional(),
  
  // JWT
  jwtSecret: z.string().min(32),
  jwtExpiresIn: z.string().default('7d'),
  jwtRefreshExpiresIn: z.string().default('30d'),
  
  // CORS
  corsOrigins: z.string().transform((str) => str.split(',')).default('http://localhost:3000'),
  
  // Email
  emailProvider: z.enum(['sendgrid', 'mailgun']).default('sendgrid'),
  emailApiKey: z.string().optional(),
  emailFromAddress: z.string().email().default('noreply@123hansa.se'),
  
  // File Storage
  storageProvider: z.enum(['local', 'aws-s3', 'gcp-storage']).default('local'),
  awsAccessKeyId: z.string().optional(),
  awsSecretAccessKey: z.string().optional(),
  awsS3Bucket: z.string().optional(),
  awsRegion: z.string().default('eu-north-1'),
  
  // Payment Providers
  stripeSecretKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
  swishCertPath: z.string().optional(),
  mobilepayApiKey: z.string().optional(),
  vippsApiKey: z.string().optional(),
  
  // Nordic APIs
  bolagsverketApiKey: z.string().optional(),
  brRegApiKey: z.string().optional(), // Norway
  cvrApiKey: z.string().optional(), // Denmark
  
  // Security
  bcryptRounds: z.coerce.number().default(12),
  rateLimitWindow: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  rateLimitMax: z.coerce.number().default(1000), // Increased for 1000+ users
  
  // Production scalability
  enableCaching: z.boolean().default(true),
  cacheTimeout: z.coerce.number().default(5 * 60), // 5 minutes
  dbConnectionPool: z.coerce.number().default(20),
  enableCompression: z.boolean().default(true),
  enableCluster: z.boolean().default(false),
  
  // Features
  enableEmailVerification: z.boolean().default(true),
  enableBankIdVerification: z.boolean().default(false),
  enableFileUploads: z.boolean().default(true),
  maxFileSize: z.coerce.number().default(10 * 1024 * 1024), // 10MB
});

const rawConfig = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Redis
  redisUrl: process.env.REDIS_URL,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS,
  
  // Email
  emailProvider: process.env.EMAIL_PROVIDER,
  emailApiKey: process.env.EMAIL_API_KEY,
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS,
  
  // File Storage
  storageProvider: process.env.STORAGE_PROVIDER,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsS3Bucket: process.env.AWS_S3_BUCKET,
  awsRegion: process.env.AWS_REGION,
  
  // Payment Providers
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  swishCertPath: process.env.SWISH_CERT_PATH,
  mobilepayApiKey: process.env.MOBILEPAY_API_KEY,
  vippsApiKey: process.env.VIPPS_API_KEY,
  
  // Nordic APIs
  bolagsverketApiKey: process.env.BOLAGSVERKET_API_KEY,
  brRegApiKey: process.env.BRREG_API_KEY,
  cvrApiKey: process.env.CVR_API_KEY,
  
  // Security
  bcryptRounds: process.env.BCRYPT_ROUNDS,
  rateLimitWindow: process.env.RATE_LIMIT_WINDOW,
  rateLimitMax: process.env.RATE_LIMIT_MAX,
  
  // Features
  enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
  enableBankIdVerification: process.env.ENABLE_BANKID_VERIFICATION === 'true',
  enableFileUploads: process.env.ENABLE_FILE_UPLOADS !== 'false',
  maxFileSize: process.env.MAX_FILE_SIZE,
  
  // Production scalability
  enableCaching: process.env.ENABLE_CACHING !== 'false',
  cacheTimeout: process.env.CACHE_TIMEOUT,
  dbConnectionPool: process.env.DB_CONNECTION_POOL,
  enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
  enableCluster: process.env.ENABLE_CLUSTER === 'true',
};

export const config = configSchema.parse(rawConfig);

// Validate required environment variables
if (config.nodeEnv === 'production') {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'EMAIL_API_KEY',
  ];
  
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}