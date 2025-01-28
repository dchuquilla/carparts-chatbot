export class ValidationRule {
    condition: (input: any) => boolean;

    constructor(condition: (input: any) => boolean) {
      this.condition = condition;
    }
    static create(condition: (input: any) => boolean): ValidationRule {
      return new ValidationRule(condition);
    }
}
