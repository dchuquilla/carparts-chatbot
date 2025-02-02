import { Redis } from 'ioredis';
import { ISessionRepository } from '../../core/session/interfaces/ISessionRepository';
import { Session } from '../../core/session/Session';
import logger from '../../infrastructure/shared/logger';
import { RequestPayload } from '../../core/messaging/WhatsAppTypes';

interface RedisConnectionOptions {
  host: string;
  port: number;
  password?: string;
}

export class RedisSessionRepository implements ISessionRepository {
  private readonly client: Redis;
  private readonly sessionTtl: number = 60 * 60; // 1 hour TTL

  constructor(options: RedisConnectionOptions) {
    this.client = new Redis({
      host: options.host,
      port: options.port,
      password: options.password,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });

    this.client.on('connect', () =>
      logger.info('Connected to Redis server'));
    this.client.on('error', (err) =>
      logger.error('[RedisConnectionOptions] Redis connection error:', options, err));
  }

  async getSession(userId: string, request: RequestPayload): Promise<Session> {
    try {
      if (request?.message) {
        return new Session(
          userId,
          request.message,
          request?.request,
          new Date(),
        );
      }

      const data = await this.client.get(this.getKey(userId));

      if (!data) {
        return new Session(
          userId,
          'GREETING',
          {},
          new Date(),
        );
      }

      return Session.fromJSON(data);
    } catch (error) {
      logger.error('Failed to get session:', error);
      throw new Error('SESSION_READ_FAILED');
    }
  }

  async updateSession(session: Session): Promise<void> {
    try {
      await this.client.setex(
        this.getKey(session.userId),
        this.sessionTtl,
        session.toJSON()
      );
    } catch (error) {
      logger.error('Failed to update session:', error);
      throw new Error('SESSION_UPDATE_FAILED');
    }
  }

  async deleteSession(userId: string): Promise<void> {
    try {
      await this.client.del(this.getKey(userId));
    } catch (error) {
      logger.error('Failed to delete session:', error);
      throw new Error('SESSION_DELETE_FAILED');
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      logger.error('Failed to disconnect from Redis:', error);
    }
  }

  private getKey(userId: string): string {
    return `session:${userId}`;
  }
}
