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
    constructor(stateFactory, sessionRepo) {
        this.stateFactory = stateFactory;
        this.sessionRepo = sessionRepo;
    }
    async processMessage(userId, message) {
        try {
            const session = await this.sessionRepo.getSession(userId);
            const currentState = this.stateFactory.create(session.currentState);
            const transition = await currentState.handleInput(message, session);
            session.transitionTo(transition.nextState(session.currentState));
            await this.sessionRepo.updateSession(session);
        }
        catch (error) {
            logger_1.default.error(`Failed to process message for user ${userId}:`, error);
            throw error;
        }
    }
};
exports.ChatEngine = ChatEngine;
exports.ChatEngine = ChatEngine = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [StateFactory_1.StateFactory, Object])
], ChatEngine);
