import { RequestPayload } from '../../messaging/WhatsAppTypes';
import { Session } from '../Session';

export interface ISessionRepository {
  getSession(userId: string, request?: RequestPayload): Promise<Session>;
  updateSession(session: Session): Promise<void>;
  deleteSession(userId: string): Promise<void>;
  disconnect(): Promise<void>;
}
