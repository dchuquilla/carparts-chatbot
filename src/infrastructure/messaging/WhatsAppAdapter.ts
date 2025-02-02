import { Request } from 'express';
import axios from 'axios';
import { container } from 'tsyringe';
import config from '../../config';
import logger from '../shared/logger';
import { MessageType, type RequestPayload, type IncomingMessage, type OutgoingMessage } from '.././../core/messaging/WhatsAppTypes';
import { OpenAIService } from '../../services/llmsources/OpenAIService';
import { ErrorHandler } from '../shared/ErrorHandler';

const openAIService = container.resolve(OpenAIService);

export class WhatsAppAdapter {
  private readonly apiVersion = 'v18.0';
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${config.whatsapp.phoneNumberId}`;
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
      await axios.post(`${this.baseUrl}/messages`, {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: message.userId,
        type: message.type,
        [message.type]: message.content
      }, {
        headers: {
          Authorization: `Bearer ${config.whatsapp.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
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
        return { message: 'TYPE NOT SUPPORTED' };
    }
  }
}
