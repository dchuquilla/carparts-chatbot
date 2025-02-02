export type StateName =
  | 'GREETING'
  | 'PARSE_REQUEST'
  | 'COLLECT_DATA'
  | 'SEARCH'
  | 'CONFIRMATION'
  | 'NO_REPLACEMENT'
  | 'ERROR_CREATE_REQUEST';

export type StateTransition = {
  from: StateName;
  to: StateName;
};
