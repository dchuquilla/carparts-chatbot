"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
class Session {
    userId;
    data;
    createdAt;
    _currentState;
    _stateHistory = [];
    constructor(userId, initialState = 'GREETING', data = {}, createdAt = new Date()) {
        this.userId = userId;
        this.data = data;
        this.createdAt = createdAt;
        this._currentState = initialState;
        this._stateHistory.push(initialState);
    }
    // Get current state
    get currentState() {
        return this._currentState;
    }
    set currentState(newState) {
        this.transitionTo(newState);
    }
    // Transition to new state with validation
    transitionTo(newState) {
        if (!this.isValidTransition(newState)) {
            throw new Error(`Invalid state transition from ${this._currentState} to ${newState}`);
        }
        this._stateHistory.push(newState);
        this._currentState = newState;
    }
    nextState(stateName) {
        let nextStateName;
        switch (stateName) {
            case 'GREETING':
                nextStateName = 'PARSE_REQUEST';
                break;
            case 'PARSE_REQUEST':
                nextStateName = 'COLLECT_DATA';
                break;
            case 'COLLECT_DATA':
                nextStateName = 'SEARCH';
                break;
            case 'SEARCH':
                nextStateName = 'CONFIRMATION';
                break;
            case 'CONFIRMATION':
                nextStateName = 'GREETING';
                break;
            default:
                nextStateName = 'GREETING';
        }
        // Use dependency injection container to resolve dependencies
        return nextStateName;
    }
    // Get state transition history
    get stateHistory() {
        return [...this._stateHistory];
    }
    get lastInput() {
        return this.data.lastInput;
    }
    // Optional: Add custom validation logic
    isValidTransition(newState) {
        const validTransitions = {
            NEW: ['GREETING'],
            GREETING: ['PARSE_REQUEST'],
            PARSE_REQUEST: ['COLLECT_DATA', 'SEARCH'],
            COLLECT_DATA: ['SEARCH'],
            SEARCH: ['CONFIRMATION', 'COLLECT_DATA'],
            CONFIRMATION: ['GREETING'],
            NO_REPLACEMENT: ['GREETING'],
            ERROR_CREATE_REQUEST: ['GREETING'],
            COMMENT: ['GREETING'],
            UNPLEASANT: ['GREETING']
        };
        return validTransitions[this._currentState]?.includes(newState) ?? false;
    }
    // Serialization
    toJSON() {
        return JSON.stringify({
            userId: this.userId,
            currentState: this._currentState,
            stateHistory: this._stateHistory,
            data: this.data,
            createdAt: this.createdAt.toISOString()
        });
    }
    // Deserialization
    static fromJSON(json) {
        const data = JSON.parse(json);
        const session = new Session(data.userId, data.currentState, data.data, new Date(data.createdAt));
        session._stateHistory = data.stateHistory;
        return session;
    }
}
exports.Session = Session;
