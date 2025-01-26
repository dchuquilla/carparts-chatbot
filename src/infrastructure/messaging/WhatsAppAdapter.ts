import { Request } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import config from '../../config';
import logger from '../shared/logger';
import { MessageType, type IncomingMessage, type OutgoingMessage } from '.././../core/messaging/WhatsAppTypes';
import { ErrorHandler } from '../shared/ErrorHandler';

export class WhatsAppAdapter {
  private readonly apiVersion = 'v18.0';
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${config.whatsapp.phoneNumberId}`;
  }

  // Parse incoming WhatsApp webhook payload
  parseIncomingMessage(body: any): IncomingMessage {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];

      if (!message) {
        throw new Error('INVALID_WHATSAPP_PAYLOAD');
      }

      return {
        userId: message.from,
        messageId: message.id,
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        type: this.getMessageType(message),
        content: this.getContent(message),
        raw: message
      };
    } catch (error) {
      logger.error('Failed to parse WhatsApp message:', error);
      throw new ErrorHandler().createError('MESSAGE_PARSE_ERROR');
    }
  }

  // Verify incoming webhook signature
  verifySignature(req: Request): boolean {
    if (!config.app.isProduction) return true;

    const signature = req.headers['x-hub-signature-256'] as string;
    if (!signature) return false;

    const hmac = crypto.createHmac('sha256', config.whatsapp.apiKey);
    const digest = hmac.update(JSON.stringify(req.body)).digest('hex');

    return `sha256=${digest}` === signature;
  }

  // Send text message to user
  async sendTextMessage(userId: string, text: string): Promise<void> {
    await this.sendMessage({
      userId,
      type: MessageType.TEXT,
      content: { body: text }
    });
  }

  // Send template message (e.g., proposal notifications)
  async sendTemplateMessage(userId: string, templateName: string, parameters: string[]): Promise<void> {
    await this.sendMessage({
      userId,
      type: MessageType.TEMPLATE,
      content: {
        name: templateName,
        components: [{
          type: 'body',
          parameters: parameters.map(value => ({ type: 'text', text: value }))
        }]
      }
    });
  }

  // Generic message sender
  private async sendMessage(message: OutgoingMessage): Promise<void> {
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
    return MessageType.UNKNOWN;
  }

  private getContent(message: any): string {
    switch (this.getMessageType(message)) {
      case MessageType.TEXT:
        return message.text.body;
      case MessageType.AUDIO:
        return message.audio.id; // Reference for audio processing
      default:
        return JSON.stringify(message);
    }
  }

  // Audio message handling (optional integration)
  async processAudioMessage(audioId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/media/${audioId}`, {
        headers: { Authorization: `Bearer ${config.whatsapp.apiKey}` }
      });

      // Here you would integrate with DeepSeek's ASR (Automatic Speech Recognition)
      // For now, return placeholder text
      return '[Audio transcription placeholder]';
    } catch (error) {
      logger.error('Failed to process audio message:', error);
      throw new ErrorHandler().createError('AUDIO_PROCESSING_FAILED');
    }
  }
}
