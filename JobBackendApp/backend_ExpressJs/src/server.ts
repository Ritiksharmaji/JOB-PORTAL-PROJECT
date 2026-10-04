import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { removeExpiredOtps } from './services/user.service.js';

async function main(): Promise<void> {
  await connectDatabase();

  const server = createApp().listen(env.port, () => {
    logger.info(`JobHook Express API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  // Spring: @Scheduled(fixedRate = 60000) removeExpiredOTPs
  const otpCleanup = setInterval(() => {
    removeExpiredOtps().catch((err) => logger.error({ err }, 'OTP cleanup failed'));
  }, 60_000);

  // Graceful shutdown: stop accepting requests, finish in-flight ones, close the DB.
  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    clearInterval(otpCleanup);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
