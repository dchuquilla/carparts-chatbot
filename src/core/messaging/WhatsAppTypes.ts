import { StateName } from "../states/StateTypes";

export enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  VOICE = 'voice',
  TEMPLATE = 'template',
  IMAGE = 'image',
  UNKNOWN = 'unknown',
  CONTACT = 'contact'
}

export interface IncomingMessage {
  userId: string;
  messageId: string;
  timestamp: Date;
  type: MessageType;
  content: RequestPayload;
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
  state: StateName;
  pending_data?: string[];
  request?: {
    part_name?: string;
    part_brand?: string;
    part_model?: string;
    part_year?: string;
    part_image?: string;
    part_chassis?: string;
  }
}
