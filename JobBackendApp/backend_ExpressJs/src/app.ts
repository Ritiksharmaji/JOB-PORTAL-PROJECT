import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';
import { router } from './routes/index.js';
import './types/auth.js';

/** Builds the Express app (no network listening — `server.ts` does that, tests use it directly). */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // behind Render/Railway/NGINX: real client IP for rate limiting
  app.use(helmet());
  // Spring's @CrossOrigin allows every origin; CORS_ORIGINS can narrow it down.
  app.use(cors({ origin: env.corsOrigins === '*' ? true : [...env.corsOrigins] }));
  // Resumes and profile pictures are sent as Base64 JSON, so allow larger bodies.
  app.use(express.json({ limit: '10mb' }));
  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === '/health' },
      customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
    }),
  );

  /** Liveness/readiness probe for hosting platforms and Docker. */
  app.get('/health', (_req, res) => {
    const dbUp = mongoose.connection.readyState === 1;
    res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'UP' : 'DOWN', database: dbUp ? 'UP' : 'DOWN' });
  });

  app.use(router);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
