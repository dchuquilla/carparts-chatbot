export type StateName =
  | 'GREETING'
  | 'PARSE_REQUEST'
  | 'COLLECT_DATA'
  | 'SEARCH'
  | 'CONFIRMATION';

export type StateTransition = {
  from: StateName;
  to: StateName;
};
