import { Session } from '../Session';

export interface ISessionRepository {
  getSession(userId: string): Promise<Session>;
  updateSession(session: Session): Promise<void>;
  deleteSession(userId: string): Promise<void>;
  disconnect(): Promise<void>;
}
