import { type IncomingMessage, type AudioMessage, RequestPayload } from "../../core/messaging/WhatsAppTypes";

export interface ILLMStrategy {
  parseMessage(input: string): Promise<RequestPayload>;
  transcribeAudio(input: AudioMessage): Promise<string>;
}
