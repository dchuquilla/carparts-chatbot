import { NextFunction, Request, Response } from 'express';
import logger from './logger';
import config from '../../config';

export class ErrorHandler {
  static handle(error: Error, res: Response) {
    logger.error('Request failed:', error);

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: config.app.isProduction
          ? 'An unexpected error occurred'
          : error.message,
      },
    });
  }

  static middleware() {
    return (error: Error, req: Request, res: Response, next: NextFunction) => {
      ErrorHandler.handle(error, res);
    };
  }

  createError(code: string, message?: string): Error {
    return new Error(message || code);
  }
}
