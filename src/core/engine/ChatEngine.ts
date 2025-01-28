import logger from "../../infrastructure/shared/logger";
import { injectable } from 'tsyringe';
import { ISessionRepository } from "../session/interfaces/ISessionRepository";
import { StateFactory } from "../states/StateFactory";

@injectable()
export class ChatEngine {
  constructor(
    private stateFactory: StateFactory,
    private sessionRepo: ISessionRepository
  ) {}

  async processMessage(userId: string, message: string): Promise<void> {
    try {
      const session = await this.sessionRepo.getSession(userId);
      const currentState = this.stateFactory.create(session.currentState);

      const transition = await currentState.handleInput(message, session);

      session.transitionTo(transition.nextState(session.currentState));
      await this.sessionRepo.updateSession(session);

    } catch (error) {
      logger.error(`Failed to process message for user ${userId}:`, error);
      throw error;
    }
  }
}
