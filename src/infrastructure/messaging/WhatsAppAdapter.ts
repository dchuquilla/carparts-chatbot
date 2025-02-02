import whapi from '@api/whapi';
import { container } from 'tsyringe';
import config from '../../config';
import logger from '../shared/logger';
import { MessageType, type RequestPayload, type IncomingMessage, type OutgoingMessage } from '.././../core/messaging/WhatsAppTypes';
import { OpenAIService } from '../../services/llmsources/OpenAIService';
import { ErrorHandler } from '../shared/ErrorHandler';

const openAIService = container.resolve(OpenAIService);

export class WhatsAppAdapter {
  constructor() {
    whapi.auth(config.whatsapp.apiKey);
  }

  // Parse incoming WhatsApp webhook payload
  async parseIncomingMessage(body: any): Promise<IncomingMessage> {
    try {
      const message = body?.messages?.[0];
      const enabledTypes = ['text', 'audio', 'voice'];

      if (!message) {
        throw new Error('INVALID_WHATSAPP_PAYLOAD');
      }

      if (enabledTypes.indexOf(message.type) === -1) {
        throw new Error('INVALID_MESSAGE_TYPE');
      }

      const messageData = await this.getContent(message);

      return {
        userId: message.from,
        messageId: message.id,
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        type: this.getMessageType(message),
        content: messageData,
        raw: message
      };
    } catch (error) {
      logger.error('Failed to parse WhatsApp message:', error);
      throw new ErrorHandler().createError('MESSAGE_PARSE_ERROR');
    }
  }

  // Send text message to user
  async sendTextMessage(userId: string, text: string): Promise<void> {
    await this.sendMessage({
      userId,
      type: MessageType.TEXT,
      content: { body: text }
    });
  }

  // Generic message sender
  private async sendMessage(message: OutgoingMessage): Promise<void> {
    if (!message.userId || !message.type || !message.content) {
      throw new Error('Invalid message object');
    }

    try {
      whapi.sendMessageText({
        to: `${message.userId}@s.whatsapp.net`,
        body: message.content.body,
      })
        .then(({ data }) => console.log(data))
        .catch(err => console.error(err));
    } catch (error) {
      logger.error('Failed to send WhatsApp message:', (error as any).response?.data || (error as any).message);
      throw new ErrorHandler().createError('MESSAGE_SEND_FAILED');
    }
  }

  private getMessageType(message: any): MessageType {
    if (message.text) return MessageType.TEXT;
    if (message.audio) return MessageType.AUDIO;
    if (message.voice) return MessageType.VOICE;
    return MessageType.UNKNOWN;
  }

  private async getContent(message: any): Promise<RequestPayload> {
    let textTranscription: string;
    switch (this.getMessageType(message)) {
      case MessageType.TEXT:
        return openAIService.parseMessage(message.text.body);
      case MessageType.AUDIO:
        textTranscription = await openAIService.transcribeAudio(message.audio);
        return openAIService.parseMessage(textTranscription);;
      case MessageType.VOICE:
        textTranscription = await openAIService.transcribeAudio(message.voice);
        return openAIService.parseMessage(textTranscription);;
      default:
        return { message: 'NO_REPLACEMENT' };
    }
  }
}
