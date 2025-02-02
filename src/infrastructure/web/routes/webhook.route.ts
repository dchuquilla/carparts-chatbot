import { Router } from 'express';
import { container } from 'tsyringe';
import { WhatsAppAdapter } from '../../messaging/WhatsAppAdapter';
import { ChatEngine } from '../../../core/engine/ChatEngine';
import config from '../../../config';
import { ErrorHandler } from '../../shared/ErrorHandler';

const router = Router();
const whatsAppAdapter = container.resolve(WhatsAppAdapter);
const chatEngine = container.resolve(ChatEngine);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.app.env,
  });
});

// WhatsApp webhook verification
router.get('/webhook/whatsapp', (req, res) => {
  const challenge = req.query['hub.challenge'];
  const verifyToken = req.query['hub.verify_token'];

  if (verifyToken === config.whatsapp.apiKey) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Verification failed');
  }
});

// Message processing endpoint
router.post('/webhook/whatsapp/messages', async (req, res) => {
  try {
    if (!req.body || !req.body.messages) {
      return res.status(400).send('Invalid request body');
    }
    console.log("body:", req.body)

    const message = await whatsAppAdapter.parseIncomingMessage(req.body);
    const response = await chatEngine.processMessage(message.userId, message.content);
    console.log("chat response:", response)

    whatsAppAdapter.sendTextMessage(message.userId, response);
    res.status(200).send('OK');
  } catch (error) {
    ErrorHandler.handle(error as Error, res);
  }
});

export default router;
