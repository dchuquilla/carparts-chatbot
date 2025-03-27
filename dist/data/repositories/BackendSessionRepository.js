"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendSessionRepository = void 0;
const axios_1 = __importDefault(require("axios"));
const Session_1 = require("../../core/session/Session");
const logger_1 = __importDefault(require("../../infrastructure/shared/logger"));
class BackendSessionRepository {
    url;
    constructor(options) {
        this.url = options.url;
    }
    async getSession(userId) {
        try {
            const backendRequestResponse = await axios_1.default.get(`${this.url}/api/v1/requests?q[user_phone_eq]=${userId}`);
            if (backendRequestResponse.data.length === 0) {
                return new Session_1.Session(userId, 'NEW', {}, new Date());
            }
            // A request was found, return a new session with request data
            return new Session_1.Session(userId, backendRequestResponse.data[0].state, backendRequestResponse.data[0], new Date());
        }
        catch (error) {
            logger_1.default.error('Failed to get session:', error);
            throw new Error('SESSION_READ_FAILED');
        }
    }
    async createSession(userId, request) {
        try {
            const session = new Session_1.Session(userId, request.state, request.request, new Date());
            await axios_1.default.post(`${this.url}/api/v1/requests`, {
                request: {
                    ...request.request,
                    user_phone: userId,
                },
            });
            return session;
        }
        catch (error) {
            logger_1.default.error('Failed to create session:', error);
            throw new Error('SESSION_CREATE_FAILED');
        }
    }
    async updateSession(session, request) {
        try {
            await axios_1.default.put(`${this.url}/api/v1/requests/${session.data.id}`, {
                request: request.request,
            });
            logger_1.default.info('Updating session:', session);
        }
        catch (error) {
            logger_1.default.error('Failed to update session:', error);
            throw new Error('SESSION_UPDATE_FAILED');
        }
    }
    async deleteSession(userId) {
        try {
            await axios_1.default.put(`${this.url}/api/v1/requests/${userId}`);
            logger_1.default.info('Deleting session for user:', userId);
        }
        catch (error) {
            logger_1.default.error('Failed to delete session:', error);
            throw new Error('SESSION_DELETE_FAILED');
        }
    }
    async disconnect() {
        try {
            logger_1.default.info('Disconnecting from backend session repository');
        }
        catch (error) {
            logger_1.default.error('Failed to disconnect from backend session repository:', error);
            throw new Error('SESSION_DISCONNECT_FAILED');
        }
    }
}
exports.BackendSessionRepository = BackendSessionRepository;
