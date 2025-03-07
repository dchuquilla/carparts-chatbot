"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const WhatsAppAdapter_1 = require("../../messaging/WhatsAppAdapter");
const ChatEngine_1 = require("../../../core/engine/ChatEngine");
const config_1 = __importDefault(require("../../../config"));
const ErrorHandler_1 = require("../../shared/ErrorHandler");
const router = (0, express_1.Router)();
const whatsAppAdapter = tsyringe_1.container.resolve(WhatsAppAdapter_1.WhatsAppAdapter);
const chatEngine = tsyringe_1.container.resolve(ChatEngine_1.ChatEngine);
// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config_1.default.app.env,
    });
});
// WhatsApp webhook verification
router.get('/webhook/whatsapp', (req, res) => {
    const challenge = req.query['hub.challenge'];
    const verifyToken = req.query['hub.verify_token'];
    if (verifyToken === config_1.default.whatsapp.apiKey) {
        res.status(200).send(challenge);
    }
    else {
        res.status(403).send('Verification failed');
    }
});
// Message processing endpoint
router.post('/webhook/whatsapp/messages', async (req, res) => {
    try {
        if (!req.body || !req.body.messages) {
            return res.status(400).send('Invalid request body');
        }
        if (req.body?.messages[0]?.from_me) {
            return res.status(200).send('OK');
        }
        if (req.body?.messages[0]?.from !== "593992513609") {
            return res.status(200).send('OK');
        }
        console.log("body:", req.body);
        const message = await whatsAppAdapter.parseIncomingMessage(req.body);
        const response = await chatEngine.processMessage(message.userId, message.content);
        console.log("chat response:", response);
        whatsAppAdapter.sendTextMessage(message.userId, response);
        res.status(200).send('OK');
    }
    catch (error) {
        ErrorHandler_1.ErrorHandler.handle(error, res);
    }
});
exports.default = router;
