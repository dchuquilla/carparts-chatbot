export class ChatEngine {
  constructor(
    private stateFactory: StateFactory,
    private sessionRepo: ISessionRepository
  ) {}

  async processMessage(userId: string, message: string): Promise<void> {
    const session = await this.sessionRepo.getSession(userId);
    const currentState = this.stateFactory.create(session.currentState);

    const transition = await currentState.handleInput(
      new UserInput(message),
      session
    );

    session.currentState = transition.nextState;
    await this.sessionRepo.updateSession(session);
  }
}
