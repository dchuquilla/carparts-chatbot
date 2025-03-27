import axios from 'axios';
import { ISessionRepository } from '../../core/session/interfaces/ISessionRepository';
import { Session } from '../../core/session/Session';
import logger from '../../infrastructure/shared/logger';
import { RequestPayload } from '../../core/messaging/WhatsAppTypes';

interface RubyOnRailsConnectionOptions {
  url: string;
}

export class BackendSessionRepository implements ISessionRepository {
  private readonly url: string;

  constructor(options: RubyOnRailsConnectionOptions) {
    this.url = options.url;
  }

  async getSession(userId: string): Promise<Session> {
    try {
      const backendRequestResponse = await axios.get(`${this.url}/api/v1/requests?q[user_phone_eq]=${userId}`);

      if (backendRequestResponse.data.length === 0) {
        return new Session(
          userId,
          'NEW',
          {},
          new Date(),
        );
      }

      // A request was found, return a new session with request data
      return new Session(
        userId,
        backendRequestResponse.data[0].state,
        backendRequestResponse.data[0],
        new Date(),
      );

    } catch (error) {
      logger.error('Failed to get session:', error);
      throw new Error('SESSION_READ_FAILED');
    }
  }

  async createSession(userId: string, request: RequestPayload): Promise<Session> {
    try {
      const session = new Session(
        userId,
        request.state,
        request.request,
        new Date(),
      );
      await axios.post(`${this.url}/api/v1/requests`, {
        request: {
          ...request.request,
          user_phone: userId,
        },
      });

      return session;
    } catch (error) {
      logger.error('Failed to create session:', error);
      throw new Error('SESSION_CREATE_FAILED');
    }
  }

  async updateSession(session: Session, request: RequestPayload): Promise<void> {
    try {
      await axios.put(`${this.url}/api/v1/requests/${session.data.id}`, {
        request: request.request,
      });
      logger.info('Updating session:', session);
    } catch (error) {
      logger.error('Failed to update session:', error);
      throw new Error('SESSION_UPDATE_FAILED');
    }
  }

  async deleteSession(userId: string): Promise<void> {
    try {
      await axios.put(`${this.url}/api/v1/requests/${userId}`);

      logger.info('Deleting session for user:', userId);
    } catch (error) {
      logger.error('Failed to delete session:', error);
      throw new Error('SESSION_DELETE_FAILED');
    }
  }

  async disconnect(): Promise<void> {
    try {
      logger.info('Disconnecting from backend session repository');
    } catch (error) {
      logger.error('Failed to disconnect from backend session repository:', error);
      throw new Error('SESSION_DISCONNECT_FAILED');
    }
  }
}
