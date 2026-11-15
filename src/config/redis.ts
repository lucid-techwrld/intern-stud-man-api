import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

export class RedisClient {
  static client: Redis | null = null;

  static async connect(): Promise<void> {
    if (!env.REDIS_URL) {
      logger.warn('REDIS_URL not set: caching disabled');
      return;
    }
    RedisClient.client = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 2 });
    RedisClient.client.on('error', (e) => logger.error('Redis error', { message: e.message }));
    await RedisClient.client.ping();
    logger.info('Redis connected');
  }

  static async disconnect(): Promise<void> {
    await RedisClient.client?.quit();
  }
}
