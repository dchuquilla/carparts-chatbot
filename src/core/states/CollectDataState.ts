import { IState } from './interfaces/IState';
import { Session } from '../session/Session';
import { injectable } from 'tsyringe';

@injectable()
class CollectDataState implements IState {
  async handleInput(input: string, session: Session): Promise<Session> {
    // Collect data from user
    session.transitionTo('SEARCH');
    return session;
  }

  getNextState(session: Session): string {
    return 'SEARCH';
  }

  getPrompt(session: Session): string {
    return 'Por favor, envíame una foto de la pieza que necesitas';
  }
}
