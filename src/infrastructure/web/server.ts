import "reflect-metadata"; // This must be at the top
import express from 'express';
import { container } from 'tsyringe';
import config from '../../config';
import logger from '../shared/logger';
import { RedisSessionRepository } from '../../data/repositories/RedisSessionRepository';
import { ErrorHandler } from '../shared/ErrorHandler';
import { StateFactory } from "../../core/states/StateFactory";
import { ChatEngine } from "../../core/engine/ChatEngine";

export async function createServer() {
  const app = express();

  // ======================
  //  Middleware Setup
  // ======================
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // ======================
  //  Dependency Injection
  // ======================
  const redisClient = new RedisSessionRepository({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    tls: config.redis.tls ? true : undefined,
  });

  container.register('ISessionRepository', {
    useValue: redisClient,
  });
  container.register('stateDependencies', {
    useValue: {
      messageParser: {},
      searchService: {},
    },
  });

  container.register('stateFactory', { useClass: StateFactory });
  container.register('chatEngine', { useClass: ChatEngine });

  // ======================
  //  Route Registration
  // ======================
  // Dynamically import routes after DI setup
  const { default: webhookRouter } = await import('./routes/webhook.route');
  app.use('/', webhookRouter);

  // ======================
  //  Error Handling
  // ======================
  app.use(ErrorHandler.middleware());

  // ======================
  //  Server Initialization
  // ======================
  const server = app.listen(config.app.port, () => {
    logger.info(`
      🚀 Server running in ${config.app.env} mode
      ➤ Listening on port ${config.app.port}
      ➤ Redis connected to ${config.redis.host}:${config.redis.port}
      ➤ PostgreSQL connected to ${config.database.url}
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received: closing server');
    server.close(async () => {
      await redisClient.disconnect();
      process.exit(0);
    });
  });

  return server;
}

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  createServer().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}
