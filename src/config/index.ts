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

  // Database (PostgreSQL)
  @IsString()
  DB_HOST!: string;

  @IsNumber()
  DB_PORT: number = 5432;

  @IsString()
  DB_USERNAME!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  DB_NAME: string = 'carparts';

  // Redis
  @IsString()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  REDIS_PORT: number = 6379;

  @IsString()
  REDIS_PASSWORD: string = '';

  // WhatsApp
  @IsString()
  WHATSAPP_API_KEY!: string;

  @IsString()
  WHATSAPP_PHONE_NUMBER_ID!: string;

  @IsString()
  WHATSAPP_BUSINESS_ACCOUNT_ID!: string;

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
}

export const validateEnvironment = () => {
  const requiredVars = [
    'DB_HOST',
    'DB_USERNAME',
    'DB_PASSWORD',
    'WHATSAPP_API_KEY',
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_BUSINESS_ACCOUNT_ID',
    'DEEPSEEK_API_KEY',
    'OPENAI_API_KEY',
    'REDIS_HOST',
    'REDIS_PORT',
    'NODE_ENV'
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

  // Database
  database: {
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    name: config.DB_NAME,
    url: `postgres://${config.DB_USERNAME}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`,
  },

  // Redis
  redis: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD,
    url: `redis://${config.REDIS_PASSWORD ? `:${config.REDIS_PASSWORD}@` : ''}${config.REDIS_HOST}:${config.REDIS_PORT}`,
  },

  // WhatsApp
  whatsapp: {
    apiKey: config.WHATSAPP_API_KEY,
    phoneNumberId: config.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: config.WHATSAPP_BUSINESS_ACCOUNT_ID,
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
};
