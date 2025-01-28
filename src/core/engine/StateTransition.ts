import { ValidationRule } from './ValidationRule';
import { StateCondition } from './StateCondition';

export class StateTransition {
  constructor(
    public nextState: string,
    public validationRules?: ValidationRule[]
  ) {}

  static create(condition: StateCondition): StateTransition {
    // Implement transition logic based on session data
    const nextState = condition.evaluate() ? 'nextState' : 'defaultState';
    const validationRules = condition.getValidationRules();
    return new StateTransition(nextState, validationRules);
  }
}
