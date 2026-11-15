import fs from 'fs';
import path from 'path';
import { Database } from './database';
import { logger } from '../utils/logger';

class Migrator {
  private dir = path.resolve(__dirname, '../../migrations');

  private async ensureTable() {
    await Database.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())');
  }

  private async runInTx(sql: string, after: { text: string; params: unknown[] }) {
    const client = await Database.getPool().connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(after.text, after.params);
      await client.query('COMMIT');
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  }

  async up() {
    await this.ensureTable();
    const done = new Set((await Database.query<{ name: string }>('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
    for (const file of fs.readdirSync(this.dir).filter((f) => f.endsWith('.up.sql')).sort()) {
      const name = file.replace('.up.sql', '');
      if (done.has(name)) continue;
      await this.runInTx(fs.readFileSync(path.join(this.dir, file), 'utf8'), { text: 'INSERT INTO schema_migrations(name) VALUES($1)', params: [name] });
      logger.info(`Applied ${name}`);
    }
  }

  async down() {
    await this.ensureTable();
    const last = (await Database.query<{ name: string }>('SELECT name FROM schema_migrations ORDER BY name DESC LIMIT 1')).rows[0];
    if (!last) return logger.info('Nothing to roll back');
    await this.runInTx(fs.readFileSync(path.join(this.dir, `${last.name}.down.sql`), 'utf8'), { text: 'DELETE FROM schema_migrations WHERE name = $1', params: [last.name] });
    logger.info(`Rolled back ${last.name}`);
  }
}

(async () => {
  const migrator = new Migrator();
  try { process.argv[2] === 'down' ? await migrator.down() : await migrator.up(); }
  catch (e) { logger.error('Migration failed', { error: (e as Error).message }); process.exitCode = 1; }
  finally { await Database.disconnect(); }
})();
