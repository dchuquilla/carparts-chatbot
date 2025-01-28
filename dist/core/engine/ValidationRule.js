"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationRule = void 0;
class ValidationRule {
    condition;
    constructor(condition) {
        this.condition = condition;
    }
    static create(condition) {
        return new ValidationRule(condition);
    }
}
exports.ValidationRule = ValidationRule;
