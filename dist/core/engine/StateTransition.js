"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateTransition = void 0;
class StateTransition {
    nextState;
    validationRules;
    constructor(nextState, validationRules) {
        this.nextState = nextState;
        this.validationRules = validationRules;
    }
    static create(condition) {
        // Implement transition logic based on session data
        const nextState = condition.evaluate() ? 'nextState' : 'defaultState';
        const validationRules = condition.getValidationRules();
        return new StateTransition(nextState, validationRules);
    }
}
exports.StateTransition = StateTransition;
