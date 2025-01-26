// Each state handles only its specific logic
class GreetingState implements IState {
  async handleInput(input: UserInput, session: Session): Promise<StateTransition> {
    // Only handles greeting logic
  }
}
