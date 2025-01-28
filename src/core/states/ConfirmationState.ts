import { IState } from './interfaces/IState';
import { Session } from '../session/Session';
import { injectable } from 'tsyringe';

@injectable()
export class ConfirmationState implements IState {
  async handleInput(input: string, session: Session): Promise<Session> {
    // Confirm parts with user
    session.transitionTo('GREETING');
    return session;
  }

  getNextState(session: Session): string {
    return 'END';
  }

  getPrompt(session: Session): string {
    return '¿Te gustaría confirmar tu pedido?';
  }
}
