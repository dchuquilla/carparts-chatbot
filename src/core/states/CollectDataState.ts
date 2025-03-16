import { IState } from './interfaces/IState';
import { Session } from '../session/Session';
import { injectable } from 'tsyringe';

@injectable()
export class CollectDataState implements IState {
  async handleInput(input: string, session: Session): Promise<Session> {
    // Collect data from user
    session.transitionTo('SEARCH');
    return session;
  }

  getNextState(session: Session): string {
    return 'SEARCH';
  }

  getPrompt(session: Session): string {
    return '📷 La fotografía fue recibida, será agregada a la solucitud.';
  }
}
