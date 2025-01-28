import { IState } from './interfaces/IState';
import { Session } from '../session/Session';
import { injectable } from 'tsyringe';

@injectable()
export class GreetingState implements IState {
  async handleInput(input: string, session: Session): Promise<Session> {
    // Initial greeting logic
    session.transitionTo('PARSE_REQUEST');
    return session;
  }

  getNextState(session: Session): string {
    return 'PARSE_REQUEST';
  }

  getPrompt(session: Session): string {
    return '¡Hola! ¿Qué repuesto necesitas para tu vehículo?';
  }
}
