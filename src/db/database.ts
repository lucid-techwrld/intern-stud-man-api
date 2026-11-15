import { Pool, QueryResultRow, types } from 'pg';
import { env } from '../config/env';
import { logger } from '../utils/logger';

types.setTypeParser(20, (v) => Number(v));
types.setTypeParser(1082, (v) => v);

export class Database {
  private static pool = new Pool({ connectionString: env.DATABASE_URL, max: 10 });

  static query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
    return Database.pool.query<T>(text, params);
  }
  static getPool() { return Database.pool; }
  static async connect() { await Database.pool.query('SELECT 1'); logger.info('PostgreSQL connected'); }
  static async disconnect() { await Database.pool.end(); }
}
