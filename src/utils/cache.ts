import { RedisClient } from '../config/redis';
import { logger } from './logger';

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await RedisClient.client?.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (e) { logger.warn('Cache get failed', { key, error: (e as Error).message }); return null; }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try { await RedisClient.client?.set(key, JSON.stringify(value), 'EX', ttlSeconds); }
    catch (e) { logger.warn('Cache set failed', { key, error: (e as Error).message }); }
  }

  async del(key: string): Promise<void> {
    try { await RedisClient.client?.del(key); }
    catch (e) { logger.warn('Cache del failed', { key, error: (e as Error).message }); }
  }
}
export const cacheService = new CacheService();
