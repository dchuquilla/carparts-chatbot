"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = __importDefault(require("../../config"));
const logger_1 = __importDefault(require("../shared/logger"));
const WhatsAppTypes_1 = require(".././../core/messaging/WhatsAppTypes");
const ErrorHandler_1 = require("../shared/ErrorHandler");
class WhatsAppAdapter {
    apiVersion = 'v18.0';
    baseUrl;
    constructor() {
        this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${config_1.default.whatsapp.phoneNumberId}`;
    }
    // Parse incoming WhatsApp webhook payload
    parseIncomingMessage(body) {
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
        }
        catch (error) {
            logger_1.default.error('Failed to parse WhatsApp message:', error);
            throw new ErrorHandler_1.ErrorHandler().createError('MESSAGE_PARSE_ERROR');
        }
    }
    // Verify incoming webhook signature
    verifySignature(req) {
        if (!config_1.default.app.isProduction)
            return true;
        const signature = req.headers['x-hub-signature-256'];
        if (!signature)
            return false;
        const hmac = crypto_1.default.createHmac('sha256', config_1.default.whatsapp.apiKey);
        const digest = hmac.update(JSON.stringify(req.body)).digest('hex');
        return `sha256=${digest}` === signature;
    }
    // Send text message to user
    async sendTextMessage(userId, text) {
        await this.sendMessage({
            userId,
            type: WhatsAppTypes_1.MessageType.TEXT,
            content: { body: text }
        });
    }
    // Send template message (e.g., proposal notifications)
    async sendTemplateMessage(userId, templateName, parameters) {
        await this.sendMessage({
            userId,
            type: WhatsAppTypes_1.MessageType.TEMPLATE,
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
    async sendMessage(message) {
        if (!message.userId || !message.type || !message.content) {
            throw new Error('Invalid message object');
        }
        try {
            await axios_1.default.post(`${this.baseUrl}/messages`, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: message.userId,
                type: message.type,
                [message.type]: message.content
            }, {
                headers: {
                    Authorization: `Bearer ${config_1.default.whatsapp.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
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
        return WhatsAppTypes_1.MessageType.UNKNOWN;
    }
    getContent(message) {
        switch (this.getMessageType(message)) {
            case WhatsAppTypes_1.MessageType.TEXT:
                return message.text.body;
            case WhatsAppTypes_1.MessageType.AUDIO:
                return message.audio.id; // Reference for audio processing
            default:
                return JSON.stringify(message);
        }
    }
    // Audio message handling (optional integration)
    async processAudioMessage(audioId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/media/${audioId}`, {
                headers: { Authorization: `Bearer ${config_1.default.whatsapp.apiKey}` }
            });
            // Here you would integrate with DeepSeek's ASR (Automatic Speech Recognition)
            // For now, return placeholder text
            return '[Audio transcription placeholder]';
        }
        catch (error) {
            logger_1.default.error('Failed to process audio message:', error);
            throw new ErrorHandler_1.ErrorHandler().createError('AUDIO_PROCESSING_FAILED');
        }
    }
}
exports.WhatsAppAdapter = WhatsAppAdapter;
