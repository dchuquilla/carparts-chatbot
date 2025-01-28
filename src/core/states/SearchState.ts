import { IState } from './interfaces/IState';
import { Session } from '../session/Session';
import { injectable } from 'tsyringe';

@injectable()
export class SearchState implements IState {
  async handleInput(input: string, session: Session): Promise<Session> {
    // Search for parts
    session.transitionTo('CONFIRMATION');
    return session;
  }

  getNextState(session: Session): string {
    return 'CONFIRMATION';
  }

  getPrompt(session: Session): string {
    return 'Estoy buscando las piezas que necesitas. Por favor, espera un momento...';
  }
}
