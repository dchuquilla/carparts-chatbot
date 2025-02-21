import { StateName } from "../states/StateTypes";

export enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  VOICE = 'voice',
  TEMPLATE = 'template',
  UNKNOWN = 'unknown'
}

export interface IncomingMessage {
  userId: string;
  messageId: string;
  timestamp: Date;
  type: MessageType;
  content: RequestPayload | SearchResultsPayload;
  raw: any;
}

export interface OutgoingMessage {
  userId: string;
  type: MessageType;
  content: any;
}

export interface TemplateComponent {
  type: string;
  parameters: TemplateParameter[];
}

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
}

export interface AudioMessage {
  id: string,
  mime_type: string,
  file_size: number,
  sha256: string,
  link: string,
  seconds: number
}

export interface RequestPayload {
  message: StateName;
  request?: ParseRequestPayload
}

export type ParseRequestPayload = {
  replacement: string;
  brand: string;
  model: string;
  year: string;
}

export type SearchResultPayload = {
  name: string,
  description: string,
  price: number,
  store: string,
  url: string,
}
export type SearchResultsPayload = {
  message: string;
  results: SearchResultPayload[];
}
