import { PrismaClient } from '@prisma/client';
import { config } from './app';
import { logger } from '@/utils/logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'info', 'warn'] : ['error'],
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
  // Production optimizations for 1000+ users
  ...config.nodeEnv === 'production' && {
    connectionLimit: 20,
    poolTimeout: 20,
    transactionOptions: {
      maxWait: 5000,
      timeout: 10000,
    },
  },
});

if (config.nodeEnv !== 'production') {
  globalThis.__prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    
    // Run a simple query to test the connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database query test successful');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database disconnected successfully');
  } catch (error) {
    logger.error('❌ Database disconnection failed:', error);
    throw error;
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDatabase();
});