import { StateName } from '../states/StateTypes';

export class Session {
  private _currentState: StateName;
  private _stateHistory: StateName[] = [];

  constructor(
    public readonly userId: string,
    initialState: StateName = 'GREETING',
    public data: Record<string, any> = {},
    public readonly createdAt: Date = new Date()
  ) {
    this._currentState = initialState;
    this._stateHistory.push(initialState);
  }

  // Get current state
  get currentState(): StateName {
    return this._currentState;
  }

  set currentState(newState: StateName) {
    this.transitionTo(newState);
  }

  // Transition to new state with validation
  transitionTo(newState: StateName): void {
    if (!this.isValidTransition(newState)) {
      throw new Error(`Invalid state transition from ${this._currentState} to ${newState}`);
    }

    this._stateHistory.push(newState);
    this._currentState = newState;
  }

  nextState(stateName?: string): StateName {
    let nextStateName: StateName;

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
  get stateHistory(): ReadonlyArray<StateName> {
    return [...this._stateHistory];
  }

  get lastInput(): string {
    return this.data.lastInput;
  }

  // Optional: Add custom validation logic
  private isValidTransition(newState: StateName): boolean {
    const validTransitions: Record<StateName, StateName[]> = {
      GREETING: ['PARSE_REQUEST'],
      PARSE_REQUEST: ['COLLECT_DATA', 'SEARCH'],
      COLLECT_DATA: ['SEARCH'],
      SEARCH: ['CONFIRMATION', 'COLLECT_DATA'],
      CONFIRMATION: ['GREETING']
    };

    return validTransitions[this._currentState]?.includes(newState) ?? false;
  }

  // Serialization
  toJSON(): string {
    return JSON.stringify({
      userId: this.userId,
      currentState: this._currentState,
      stateHistory: this._stateHistory,
      data: this.data,
      createdAt: this.createdAt.toISOString()
    });
  }

  // Deserialization
  static fromJSON(json: string): Session {
    const data = JSON.parse(json);
    const session = new Session(
      data.userId,
      data.currentState,
      data.data,
      new Date(data.createdAt)
    );
    session._stateHistory = data.stateHistory;
    return session;
  }
}
