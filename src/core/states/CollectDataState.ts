class CollectDataState implements IState {
  async handleInput(input: UserInput, session: Session) {
    const validator = new CarDataValidator();
    const result = validator.validate(input);

    if (!result.isValid) {
      return new StateTransition('COLLECT_DATA', result.errors);
    }

    session.data = { ...session.data, ...input };
    return new StateTransition('SEARCH');
  }
}
