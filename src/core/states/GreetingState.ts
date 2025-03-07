import { injectable } from 'tsyringe';
import { IState } from './interfaces/IState';
import { Session } from '../session/Session';

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
    return `💁‍♂️ ¡Hola! Bienvenido a QuienTiene.com. \n\n*El repuesto ideal sin complicaciones*. \n\nPor favor dime ¿Qué repuesto necesitas para tu auto?`;
  }
}
