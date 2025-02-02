import logger from "../../infrastructure/shared/logger";
import { injectable, inject } from 'tsyringe';
import { ISessionRepository } from "../session/interfaces/ISessionRepository";
import { StateFactory } from "../states/StateFactory";
import { type RequestPayload } from "../messaging/WhatsAppTypes";

@injectable()
export class ChatEngine {
  constructor(
    @inject('stateFactory') private stateFactory: StateFactory,
    @inject('ISessionRepository') private sessionRepo: ISessionRepository
  ) {}

  async processMessage(userId: string, messagePayload: RequestPayload): Promise<string> {
    console.log('Processing message:', messagePayload);
    try {
      const session = await this.sessionRepo.getSession(userId, messagePayload);
      const currentState = this.stateFactory.create(session.currentState);

      const transition = await currentState.handleInput(messagePayload.message, session);

      session.transitionTo(transition.nextState(session.currentState));
      await this.sessionRepo.updateSession(session);

      return currentState.getPrompt(session);

    } catch (error) {
      logger.error(`Failed to process message for user ${userId}:`, error);
      throw error;
    }
  }
}
