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
router.post('/webhook/whatsapp', async (req, res) => {
  try {
    if (!req.body || !req.body.entry) {
      return res.status(400).send('Invalid request body');
    }

    if (config.app.isProduction) {
      const isValid = whatsAppAdapter.verifySignature(req);
      if (!isValid) return res.status(401).send('Invalid signature');
    }
    console.log("body:", req.body)
    const message = whatsAppAdapter.parseIncomingMessage(req.body);
    await chatEngine.processMessage(message.userId, message.content);
    res.status(200).send('OK');
  } catch (error) {
    ErrorHandler.handle(error as Error, res);
  }
});

export default router;
