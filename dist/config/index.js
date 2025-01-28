"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironment = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const dotenv = __importStar(require("dotenv"));
// Load environment variables from .env file
dotenv.config();
class EnvironmentVariables {
    // App Configuration
    APP_PORT = 3000;
    NODE_ENV = 'development';
    // Database (PostgreSQL)
    DB_HOST;
    DB_PORT = 5432;
    DB_USERNAME;
    DB_PASSWORD;
    DB_NAME = 'carparts';
    // Redis
    REDIS_HOST = 'localhost';
    REDIS_PORT = 6379;
    REDIS_PASSWORD = '';
    // WhatsApp
    WHATSAPP_API_KEY;
    WHATSAPP_PHONE_NUMBER_ID;
    WHATSAPP_BUSINESS_ACCOUNT_ID;
    // DeepSeek API
    DEEPSEEK_API_KEY;
    DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
    // Validation
    ENABLE_REQUEST_VALIDATION = true;
    // Security
    SESSION_SECRET = 'your-secret-key-here';
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "APP_PORT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NODE_ENV", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_HOST", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "DB_PORT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_USERNAME", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_PASSWORD", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_NAME", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "REDIS_HOST", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "REDIS_PORT", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "REDIS_PASSWORD", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "WHATSAPP_API_KEY", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "WHATSAPP_PHONE_NUMBER_ID", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "WHATSAPP_BUSINESS_ACCOUNT_ID", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DEEPSEEK_API_KEY", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DEEPSEEK_BASE_URL", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EnvironmentVariables.prototype, "ENABLE_REQUEST_VALIDATION", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SESSION_SECRET", void 0);
const validateEnvironment = () => {
    const requiredVars = [
        'DB_HOST',
        'DB_USERNAME',
        'DB_PASSWORD',
        'WHATSAPP_API_KEY',
        'WHATSAPP_PHONE_NUMBER_ID',
        'WHATSAPP_BUSINESS_ACCOUNT_ID',
        'DEEPSEEK_API_KEY',
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    const config = (0, class_transformer_1.plainToInstance)(EnvironmentVariables, process.env, {
        enableImplicitConversion: true,
        excludeExtraneousValues: false,
    });
    const errors = (0, class_validator_1.validateSync)(config, { skipMissingProperties: false });
    if (errors.length > 0) {
        throw new Error(`Missing or invalid environment variables:\n${errors
            .map((e) => `- ${e.property}: ${Object.values(e.constraints || {}).join(', ')}`)
            .join('\n')}`);
    }
    return config;
};
exports.validateEnvironment = validateEnvironment;
// Validate and export configuration
const config = (0, exports.validateEnvironment)();
// Export typed configuration
exports.default = {
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
    // Features
    features: {
        validateRequests: config.ENABLE_REQUEST_VALIDATION,
    },
    // Security
    security: {
        sessionSecret: config.SESSION_SECRET,
    },
};
