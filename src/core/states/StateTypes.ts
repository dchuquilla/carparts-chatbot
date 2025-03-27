export type StateName =
  | 'NEW'
  | 'GREETING'
  | 'PARSE_REQUEST'
  | 'COLLECT_DATA'
  | 'SEARCH'
  | 'CONFIRMATION'
  | 'NO_REPLACEMENT'
  | 'ERROR_CREATE_REQUEST'
  | 'COMMENT'
  | 'UNPLEASANT'
  | number
  ;

export type StateTransition = {
  from: StateName;
  to: StateName;
};
