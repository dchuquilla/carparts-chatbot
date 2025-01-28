"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateCondition = void 0;
class StateCondition {
    validationRules;
    constructor(validationRules) {
        this.validationRules = validationRules;
    }
    static create(validationRules) {
        return new StateCondition(validationRules);
    }
    evaluate() {
        return this.validationRules.every(rule => rule.condition(null));
    }
    getValidationRules() {
        return this.validationRules;
    }
}
exports.StateCondition = StateCondition;
