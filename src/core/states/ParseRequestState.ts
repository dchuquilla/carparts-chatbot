import { IState } from './interfaces/IState';
import { Session } from '../session/Session';
import { injectable } from 'tsyringe';

@injectable()
export class ParseRequestState implements IState {
  async handleInput(input: string, session: Session): Promise<Session> {
    // Parse incoming message

    session.transitionTo('COLLECT_DATA');
    return session;
  }

  getNextState(session: Session): string {
    return 'COLLECT_DATA';
  }

  getPrompt(session: Session): string {
    return 'Estamos procesando tu solicitud, por favor espera un momento...';
  }
}
