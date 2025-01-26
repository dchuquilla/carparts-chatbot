export class StateTransition {
  constructor(
    public nextState: string,
    public validationRules?: ValidationRule[]
  ) {}

  static create(condition: StateCondition): StateTransition {
    // Implement transition logic based on session data
  }
}
