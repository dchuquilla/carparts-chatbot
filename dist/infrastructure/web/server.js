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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
require("reflect-metadata"); // This must be at the top
const express_1 = __importDefault(require("express"));
const tsyringe_1 = require("tsyringe");
const config_1 = __importDefault(require("../../config"));
const logger_1 = __importDefault(require("../shared/logger"));
const RedisSessionRepository_1 = require("../../data/repositories/RedisSessionRepository");
const ErrorHandler_1 = require("../shared/ErrorHandler");
const StateFactory_1 = require("../../core/states/StateFactory");
const ChatEngine_1 = require("../../core/engine/ChatEngine");
const RubyOnRailsBackend_1 = require("../../services/backends/RubyOnRailsBackend");
async function createServer() {
    const app = (0, express_1.default)();
    // ======================
    //  Middleware Setup
    // ======================
    app.use(express_1.default.json({ limit: '50kb' })); // Increase the limit here
    app.use(express_1.default.urlencoded({ limit: '50kb', extended: true })); // Increase the limit here
    // Security headers
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        next();
    });
    // Request logging
    app.use((req, res, next) => {
        logger_1.default.info(`${req.method} ${req.path}`);
        next();
    });
    // ======================
    //  Dependency Injection
    // ======================
    const redisClient = new RedisSessionRepository_1.RedisSessionRepository({
        host: config_1.default.redis.host,
        port: config_1.default.redis.port,
        password: config_1.default.redis.password,
    });
    tsyringe_1.container.register('ISessionRepository', {
        useValue: redisClient,
    });
    tsyringe_1.container.register('stateDependencies', {
        useValue: {
            messageParser: {},
            searchService: {},
        },
    });
    tsyringe_1.container.register('stateFactory', { useClass: StateFactory_1.StateFactory });
    tsyringe_1.container.register('chatEngine', { useClass: ChatEngine_1.ChatEngine });
    const backendClient = new RubyOnRailsBackend_1.RubyOnRailsBackend({
        url: config_1.default.backend.url,
    });
    tsyringe_1.container.register('IBackendRepository', {
        useValue: backendClient
    });
    // ======================
    //  Route Registration
    // ======================
    // Dynamically import routes after DI setup
    const { default: webhookRouter } = await Promise.resolve().then(() => __importStar(require('./routes/webhook.route')));
    app.use('/', webhookRouter);
    // ======================
    //  Error Handling
    // ======================
    app.use(ErrorHandler_1.ErrorHandler.middleware());
    // ======================
    //  Server Initialization
    // ======================
    const server = app.listen(config_1.default.app.port, () => {
        logger_1.default.info(`
      🚀 Server running in ${config_1.default.app.env} mode
      ➤ Listening on port ${config_1.default.app.port}
      ➤ Redis connected to ${config_1.default.redis.host}:${config_1.default.redis.port}
      ➤ PostgreSQL connected to ${config_1.default.database.url}
    `);
    });
    // Graceful shutdown
    process.on('SIGTERM', () => {
        logger_1.default.info('SIGTERM received: closing server');
        server.close(async () => {
            await redisClient.disconnect();
            process.exit(0);
        });
    });
    return server;
}
// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
    createServer().catch((error) => {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    });
}
