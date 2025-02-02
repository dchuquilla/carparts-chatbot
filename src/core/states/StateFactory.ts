import { container, injectable, inject } from 'tsyringe';
import { IState } from './interfaces/IState';
import { GreetingState } from './GreetingState';
import { ParseRequestState } from './ParseRequestState';
import { CollectDataState } from './CollectDataState';
import { SearchState } from './SearchState';
import { ConfirmationState } from './ConfirmationState';
import { NoReplacementState } from './NoReplacementState';

type StateDependencies = {
  messageParser: any; // Replace with actual MessageParser type
  searchService: any; // Replace with actual SearchService type
};

@injectable()
export class StateFactory {
  private readonly states: Record<string, new () => IState> = {
    GREETING: GreetingState,
    PARSE_REQUEST: ParseRequestState,
    COLLECT_DATA: CollectDataState,
    SEARCH: SearchState,
    CONFIRMATION: ConfirmationState,
    NO_REPLACEMENT: NoReplacementState,
  };

  constructor( @inject('stateDependencies') private StateDependencies: StateDependencies ) { }

  create(stateName: string): IState {
    const StateClass = this.states[stateName];

    if (!StateClass) {
      throw new Error(`Invalid state: ${stateName}`);
    }

    // Use dependency injection container to resolve dependencies
    return container.resolve(StateClass);
  }


}
