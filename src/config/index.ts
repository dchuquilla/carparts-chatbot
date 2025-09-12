import { plainToInstance } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, validateSync } from 'class-validator';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

class EnvironmentVariables {
  // App Configuration
  @IsNumber()
  APP_PORT: number = 3000;

  @IsString()
  NODE_ENV: string = 'development';

  // WhatsApp
  @IsString()
  WHATSAPP_API_KEY!: string;

  // DeepSeek API
  @IsString()
  DEEPSEEK_API_KEY!: string;

  @IsString()
  DEEPSEEK_BASE_URL: string = 'https://api.deepseek.com/v1';

  // OpenAI
  @IsString()
  OPENAI_API_KEY!: string;

  // Validation
  @IsBoolean()
  ENABLE_REQUEST_VALIDATION: boolean = true;

  // Security
  @IsString()
  SESSION_SECRET: string = 'your-secret-key-here';

  // Backend
  @IsString()
  BACKEND_URL: string = 'https://dev-api.quientiene.com';

  // Web
  @IsString()
  WEB_URL: string = 'https://dev-webs.quientiene.com';
}

export const validateEnvironment = () => {
  const requiredVars = [
    'WHATSAPP_API_KEY',
    'DEEPSEEK_API_KEY',
    'OPENAI_API_KEY',
    'NODE_ENV',
    'BACKEND_URL',
    'WEB_URL'
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  const config = plainToInstance(EnvironmentVariables, process.env, {
    enableImplicitConversion: true,
    excludeExtraneousValues: false,
  });

  const errors = validateSync(config, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `Missing or invalid environment variables:\n${errors
        .map((e) => `- ${e.property}: ${Object.values(e.constraints || {}).join(', ')}`)
        .join('\n')}`
    );
  }

  return config;
};

// Validate and export configuration
const config = validateEnvironment();

// Export typed configuration
export default {
  // Core App
  app: {
    port: config.APP_PORT,
    env: config.NODE_ENV,
    isProduction: config.NODE_ENV === 'production',
  },

  // WhatsApp
  whatsapp: {
    apiKey: config.WHATSAPP_API_KEY,
  },

  // DeepSeek
  deepseek: {
    apiKey: config.DEEPSEEK_API_KEY,
    baseUrl: config.DEEPSEEK_BASE_URL,
  },

  // OpenAI
  openai: {
    apiKey: config.OPENAI_API_KEY,
  },

  // Features
  features: {
    validateRequests: config.ENABLE_REQUEST_VALIDATION,
  },

  // Security
  security: {
    sessionSecret: config.SESSION_SECRET,
  },

  // Backend
  backend: {
    url: config.BACKEND_URL,
  },

  // Web
  web: {
    url: config.WEB_URL,
  },
};
