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
  content: string;
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
