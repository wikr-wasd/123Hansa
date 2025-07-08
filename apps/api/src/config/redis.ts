import { createClient } from 'redis';
import { config } from './app';
import { logger } from '@/utils/logger';

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

export async function connectRedis(): Promise<RedisClient> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: config.redisUrl,
      socket: {
        connectTimeout: 5000,
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis Client Connected');
    });

    redisClient.on('reconnecting', () => {
      logger.info('🔄 Redis Client Reconnecting');
    });

    redisClient.on('end', () => {
      logger.info('❌ Redis Client Connection Ended');
    });

    await redisClient.connect();
    logger.info('✅ Redis connected successfully');
    
    return redisClient;
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    // Don't throw error - Redis is optional for development
    if (config.nodeEnv === 'production') {
      throw error;
    }
    return null as any;
  }
}

export function getRedisClient(): RedisClient | null {
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      logger.info('✅ Redis disconnected successfully');
    } catch (error) {
      logger.error('❌ Redis disconnection failed:', error);
    }
  }
}

// Session helper functions
export class RedisSession {
  private static prefix = 'session:';
  
  static async set(sessionId: string, data: any, expiresIn: number = 7 * 24 * 60 * 60): Promise<void> {
    if (!redisClient) return;
    
    const key = `${this.prefix}${sessionId}`;
    await redisClient.setEx(key, expiresIn, JSON.stringify(data));
  }
  
  static async get(sessionId: string): Promise<any | null> {
    if (!redisClient) return null;
    
    const key = `${this.prefix}${sessionId}`;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  static async delete(sessionId: string): Promise<void> {
    if (!redisClient) return;
    
    const key = `${this.prefix}${sessionId}`;
    await redisClient.del(key);
  }
  
  static async refresh(sessionId: string, expiresIn: number = 7 * 24 * 60 * 60): Promise<void> {
    if (!redisClient) return;
    
    const key = `${this.prefix}${sessionId}`;
    await redisClient.expire(key, expiresIn);
  }
}