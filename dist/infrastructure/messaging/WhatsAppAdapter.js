"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppAdapter = void 0;
const tsyringe_1 = require("tsyringe");
const config_1 = __importDefault(require("../../config"));
const logger_1 = __importDefault(require("../shared/logger"));
const WhatsAppTypes_1 = require(".././../core/messaging/WhatsAppTypes");
const OpenAIService_1 = require("../../services/llmsources/OpenAIService");
const ErrorHandler_1 = require("../shared/ErrorHandler");
const openAIService = tsyringe_1.container.resolve(OpenAIService_1.OpenAIService);
class WhatsAppAdapter {
    // Parse incoming WhatsApp webhook payload
    async parseIncomingMessage(body) {
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
        }
        catch (error) {
            logger_1.default.error('Failed to parse WhatsApp message:', error);
            throw new ErrorHandler_1.ErrorHandler().createError('MESSAGE_PARSE_ERROR');
        }
    }
    // Send text message to user
    async sendTextMessage(userId, text) {
        await this.sendMessage({
            userId,
            type: WhatsAppTypes_1.MessageType.TEXT,
            content: { body: text }
        });
    }
    // Generic message sender
    async sendMessage(message) {
        if (!message.userId || !message.type || !message.content) {
            throw new Error('Invalid message object');
        }
        try {
            const whapiOptions = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authorization: `Bearer ${config_1.default.whatsapp.apiKey}`
                },
                body: JSON.stringify({
                    to: `${message.userId}@s.whatsapp.net`,
                    body: message.content.body
                })
            };
            fetch('https://gate.whapi.cloud/messages/text', whapiOptions)
                .then(res => res.json())
                .then(res => console.log(res))
                .catch(err => console.error(err));
        }
        catch (error) {
            logger_1.default.error('Failed to send WhatsApp message:', error.response?.data || error.message);
            throw new ErrorHandler_1.ErrorHandler().createError('MESSAGE_SEND_FAILED');
        }
    }
    getMessageType(message) {
        if (message.text)
            return WhatsAppTypes_1.MessageType.TEXT;
        if (message.audio)
            return WhatsAppTypes_1.MessageType.AUDIO;
        if (message.voice)
            return WhatsAppTypes_1.MessageType.VOICE;
        if (message.image)
            return WhatsAppTypes_1.MessageType.IMAGE;
        return WhatsAppTypes_1.MessageType.UNKNOWN;
    }
    async getContent(message) {
        let textTranscription;
        switch (this.getMessageType(message)) {
            case WhatsAppTypes_1.MessageType.TEXT:
                return openAIService.parseMessage(message.text.body);
            case WhatsAppTypes_1.MessageType.AUDIO || WhatsAppTypes_1.MessageType.VOICE:
                textTranscription = await openAIService.transcribeAudio(message.voice);
                return openAIService.parseMessage(textTranscription);
            case WhatsAppTypes_1.MessageType.IMAGE:
                return { state: 'COLLECT_DATA', request: { part_image: message.image.link } };
            default:
                return { state: 'NO_REPLACEMENT' };
        }
    }
}
exports.WhatsAppAdapter = WhatsAppAdapter;
