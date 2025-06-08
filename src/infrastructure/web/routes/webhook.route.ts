import { Router } from 'express';
import logger from "../../shared/logger";
import { container } from 'tsyringe';
import { WhatsAppAdapter } from '../../messaging/WhatsAppAdapter';
import { ChatEngine } from '../../../core/engine/ChatEngine';
import config from '../../../config';
import { ErrorHandler } from '../../shared/ErrorHandler';
import rateLimit from 'express-rate-limit';

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

// Message processing endpoint
const messageRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each user to 10 requests per windowMs
  keyGenerator: (req) => req.body?.messages[0]?.from || '', // use the message sender as the key
  handler: (req, res) => {
    res.status(429).send('Too many requests, please try again later.');
  },
});

router.post('/webhook/whatsapp/messages', messageRateLimiter, async (req, res) => {
  try {
    if (!req.body || !req.body.messages) {
      return res.status(400).send('Invalid request body');
    }

    if (req.body?.messages[0]?.from_me) {
      return res.status(200).send('OK');
    }

    if (!["593992513609"].includes(req.body.messages[0].from)) {
      return res.status(200).send('OK');
    }

    const message = await whatsAppAdapter.parseIncomingMessage(req.body);
    const response = await chatEngine.processMessage(message.userId, message.content);
    if (response) {
      whatsAppAdapter.sendTextMessage(message.userId, response);
    }
    res.status(200).send('OK');
  } catch (error) {
    ErrorHandler.handle(error as Error, res);
  }
});

router.post('/webhook/requests/notify', async (req, res) => {
  try {
    logger.info("Request body:", req.body);
    const carRequest = req.body;

    whatsAppAdapter.sendTextMessage(carRequest.userId, carRequest.message);
    res.status(200).send('OK');
  } catch (error) {
    ErrorHandler.handle(error as Error, res);
  }
});

router.post('/webhook/stores/notify', async (req, res) => {
  try {
    logger.info("Request body:", req.body);
    const store = req.body;

    await whatsAppAdapter.sendTextMessage(store.userId, store.message);
    res.status(200).send('OK');
  } catch (error) {
    ErrorHandler.handle(error as Error, res);
  }
});

export default router;
