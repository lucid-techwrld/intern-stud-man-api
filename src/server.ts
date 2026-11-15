import { Server } from 'http';
import app from './app';
import { env } from './config/env';
import { RedisClient } from './config/redis';
import { Database } from './db/database';
import { logger } from './utils/logger';

class Bootstrap {
  private server?: Server;

  async start() {
    await Database.connect();
    await RedisClient.connect();
    this.server = app.listen(env.PORT, () => logger.info(`API listening on :${env.PORT} (${env.NODE_ENV})`));
    this.registerShutdown();
  }

  private registerShutdown() {
    (['SIGINT', 'SIGTERM'] as const).forEach((sig) => process.on(sig, () => this.shutdown(sig)));
    process.on('unhandledRejection', (r) => logger.error('Unhandled rejection', { reason: String(r) }));
  }

  private async shutdown(signal: string) {
    logger.info(`${signal} received, shutting down`);
    const force = setTimeout(() => process.exit(1), 10_000);
    this.server?.close(async () => {
      await Promise.allSettled([Database.disconnect(), RedisClient.disconnect()]);
      clearTimeout(force);
      process.exit(0);
    });
  }
}

new Bootstrap().start().catch((e) => { logger.error('Failed to start', { error: (e as Error).message }); process.exit(1); });
