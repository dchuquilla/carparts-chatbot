import { ValidationRule } from "./ValidationRule";

export class StateCondition {
  constructor(
    public validationRules: ValidationRule[]
  ) {}

  static create(validationRules: ValidationRule[]): StateCondition {
    return new StateCondition(validationRules);
  }

  evaluate(): boolean {
    return this.validationRules.every(rule => rule.condition(null));
  }

  getValidationRules(): ValidationRule[] {
    return this.validationRules;
  }
}
