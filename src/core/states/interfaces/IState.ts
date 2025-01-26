export interface IState {
  enter(session: Session): Promise<string>;
  handleInput(input: UserInput, session: Session): Promise<StateTransition>;
  exit(session: Session): Promise<void>;
}
