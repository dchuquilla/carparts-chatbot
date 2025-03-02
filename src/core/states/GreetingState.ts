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
    return '¡Hola! Soy un BOT creado para ayudarte a buscar el repuesto ideal y sin complicaciones. Por favor dime, ¿Qué repuesto necesitas para tu vehículo?';
  }
}
