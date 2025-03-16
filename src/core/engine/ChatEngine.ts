import logger from "../../infrastructure/shared/logger";
import { injectable, inject } from 'tsyringe';
import { ISessionRepository } from "../session/interfaces/ISessionRepository";
import { IBackendRepository } from "../../services/interfaces/IBackendRepository";
import { StateFactory } from "../states/StateFactory";
import { type RequestPayload } from "../messaging/WhatsAppTypes";
import { Session } from "../session/Session";

@injectable()
export class ChatEngine {
  constructor(
    @inject('stateFactory') private stateFactory: StateFactory,
    @inject('ISessionRepository') private sessionRepo: ISessionRepository,
    @inject('IBackendRepository') private backendRepo: IBackendRepository
  ) { }

  async processMessage(userId: string, messagePayload: RequestPayload): Promise<string> {
    console.log('Processing message:', messagePayload);
    try {
      const session = await this.sessionRepo.getSession(userId, messagePayload);
      const currentState = this.stateFactory.create(session.currentState);
      const transition = await currentState.handleInput(messagePayload.message, session);
      const nextState = transition.nextState(session.currentState)

      session.transitionTo(nextState);
      this.handleRequest(nextState, transition);
      await this.sessionRepo.updateSession(session);
      return currentState.getPrompt(session);

    } catch (error) {
      logger.error(`Failed to process message for user ${userId}:`, error);
      throw error;
    }
  }

  async handleRequest(state: string, request: Session): Promise<void> {
    if (state === 'GREETINGS') {
      return;
    }
    const requestPayload = {
      user_phone: request.userId,
      part_name: request.data.replacement,
      part_brand: request.data.brand,
      part_model: request.data.model,
      part_year: request.data.year,
      part_image: request.data.image,
    };
    await this.backendRepo.saveRequest(requestPayload);
  }
}
