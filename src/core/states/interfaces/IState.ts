import { Session } from '../../session/Session';

export interface IState {
  handleInput(input: string, session: Session): Promise<Session>;
  getNextState(session: Session): string;
  getPrompt(session: Session): string;
}
