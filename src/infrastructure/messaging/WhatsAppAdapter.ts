import { container } from 'tsyringe';
import config from '../../config';
import logger from '../shared/logger';
import { MessageType, type RequestPayload, type IncomingMessage, type OutgoingMessage } from '.././../core/messaging/WhatsAppTypes';
import { OpenAIService } from '../../services/llmsources/OpenAIService';
import { ErrorHandler } from '../shared/ErrorHandler';

const openAIService = container.resolve(OpenAIService);

export class WhatsAppAdapter {
  // Parse incoming WhatsApp webhook payload
  async parseIncomingMessage(body: any): Promise<IncomingMessage> {
    console.log('Received WhatsApp webhook payload:', JSON.stringify(body, null, 2));
    try {
      const message = body?.messages?.[0];
      const enabledTypes = ['text', 'audio', 'voice', 'image'];

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

  // Send contact message to user
  async sendContactMessage(userId: string, contact: string): Promise<void> {
    await this.sendMessage({
      userId,
      type: MessageType.CONTACT,
      content: { body: contact }
    });
  }

  // Generic message sender
  private async sendMessage(message: OutgoingMessage): Promise<void> {
    if (!message.userId || !message.type || !message.content) {
      throw new Error('Invalid message object');
    }

    try {
      let whapiOptions = {};
      switch (message.type) {
        case MessageType.TEXT:
          whapiOptions = {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              authorization: `Bearer ${config.whatsapp.apiKey}`
            },
            body: JSON.stringify({
              to: `${message.userId}@s.whatsapp.net`,
              body: message.content.body
            })
          };
          break;

        case MessageType.CONTACT:
          whapiOptions = {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
              authorization: `Bearer ${config.whatsapp.apiKey}`
            },
            body: JSON.stringify({
              to: `${message.userId}@s.whatsapp.net`,
              vcard: message.content.body,
              name: 'Contacto'
            })
          };
          break;
      
        default:
          break;
      }

      fetch(`https://gate.whapi.cloud/messages/${message.type}`, whapiOptions)
        .then(res => res.json())
        .then(res => console.log(res))
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
    if (message.image) return MessageType.IMAGE;
    return MessageType.UNKNOWN;
  }

  private async getContent(message: any): Promise<RequestPayload> {
    let textTranscription: string;
    switch (this.getMessageType(message)) {
      case MessageType.TEXT:
        return openAIService.parseMessage(message.text.body);
      case MessageType.AUDIO:
        textTranscription = await openAIService.transcribeAudio(message.audio);
        return openAIService.parseMessage(textTranscription);
      case MessageType.VOICE:
        textTranscription = await openAIService.transcribeAudio(message.voice);
        return openAIService.parseMessage(textTranscription);   
      case MessageType.IMAGE:
        return { state: 'COLLECT_DATA', request: { part_image: message.image.link } };
      default:
        return { state: 'NO_REPLACEMENT' };
    }
  }
}
