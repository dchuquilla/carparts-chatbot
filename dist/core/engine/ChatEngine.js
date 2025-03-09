"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatEngine = void 0;
const logger_1 = __importDefault(require("../../infrastructure/shared/logger"));
const tsyringe_1 = require("tsyringe");
const StateFactory_1 = require("../states/StateFactory");
let ChatEngine = class ChatEngine {
    stateFactory;
    sessionRepo;
    backendRepo;
    constructor(stateFactory, sessionRepo, backendRepo) {
        this.stateFactory = stateFactory;
        this.sessionRepo = sessionRepo;
        this.backendRepo = backendRepo;
    }
    async processMessage(userId, messagePayload) {
        console.log('Processing message:', messagePayload);
        try {
            const session = await this.sessionRepo.getSession(userId, messagePayload);
            const currentState = this.stateFactory.create(session.currentState);
            const transition = await currentState.handleInput(messagePayload.message, session);
            const nextState = transition.nextState(session.currentState);
            session.transitionTo(nextState);
            this.handleRequest(nextState, transition);
            await this.sessionRepo.updateSession(session);
            return currentState.getPrompt(session);
        }
        catch (error) {
            logger_1.default.error(`Failed to process message for user ${userId}:`, error);
            throw error;
        }
    }
    async handleRequest(state, request) {
        if (state !== 'SEARCH') {
            return;
        }
        const requestPayload = {
            user_phone: request.userId,
            part_name: request.data.replacement,
            part_brand: request.data.brand,
            part_model: request.data.model,
            part_year: request.data.year
        };
        await this.backendRepo.saveRequest(requestPayload);
    }
};
exports.ChatEngine = ChatEngine;
exports.ChatEngine = ChatEngine = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('stateFactory')),
    __param(1, (0, tsyringe_1.inject)('ISessionRepository')),
    __param(2, (0, tsyringe_1.inject)('IBackendRepository')),
    __metadata("design:paramtypes", [StateFactory_1.StateFactory, Object, Object])
], ChatEngine);
