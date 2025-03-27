import { RequestPayload } from '../../messaging/WhatsAppTypes';
import { Session } from '../Session';

export interface ISessionRepository {
  getSession(userId: string, request?: RequestPayload): Promise<Session>;
  createSession(userId: string, request?: RequestPayload): Promise<Session>;
  updateSession(session: Session, request?: RequestPayload): Promise<void>;
  deleteSession(userId: string): Promise<void>;
  disconnect(): Promise<void>;
}
