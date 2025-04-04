"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisSessionRepository = void 0;
const ioredis_1 = require("ioredis");
const Session_1 = require("../../core/session/Session");
const logger_1 = __importDefault(require("../../infrastructure/shared/logger"));
class RedisSessionRepository {
    client;
    sessionTtl = 60 * 60; // 1 hour TTL
    constructor(options) {
        this.client = new ioredis_1.Redis({
            host: options.host,
            port: options.port,
            password: options.password,
            retryStrategy: (times) => Math.min(times * 100, 3000),
        });
        this.client.on('connect', () => logger_1.default.info('Connected to Redis server'));
        this.client.on('error', (err) => logger_1.default.error('[RedisConnectionOptions] Redis connection error:', options, err));
    }
    async getSession(userId, request) {
        try {
            if (request?.state) {
                return new Session_1.Session(userId, request.state, request?.request, new Date());
            }
            const data = await this.client.get(this.getKey(userId));
            if (!data) {
                return new Session_1.Session(userId, 'GREETING', {}, new Date());
            }
            return Session_1.Session.fromJSON(data);
        }
        catch (error) {
            logger_1.default.error('Failed to get session:', error);
            throw new Error('SESSION_READ_FAILED');
        }
    }
    async createSession(userId, request) {
        try {
            const session = new Session_1.Session(userId, request.state, request.request, new Date());
            return session;
        }
        catch (error) {
            logger_1.default.error('Failed to create session:', error);
            throw new Error('SESSION_CREATE_FAILED');
        }
    }
    async updateSession(session) {
        try {
            await this.client.setex(this.getKey(session.userId), this.sessionTtl, session.toJSON());
        }
        catch (error) {
            logger_1.default.error('Failed to update session:', error);
            throw new Error('SESSION_UPDATE_FAILED');
        }
    }
    async deleteSession(userId) {
        try {
            await this.client.del(this.getKey(userId));
        }
        catch (error) {
            logger_1.default.error('Failed to delete session:', error);
            throw new Error('SESSION_DELETE_FAILED');
        }
    }
    async disconnect() {
        try {
            await this.client.quit();
        }
        catch (error) {
            logger_1.default.error('Failed to disconnect from Redis:', error);
        }
    }
    getKey(userId) {
        return `session:${userId}`;
    }
}
exports.RedisSessionRepository = RedisSessionRepository;
