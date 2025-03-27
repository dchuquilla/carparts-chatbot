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
let ChatEngine = class ChatEngine {
    sessionRepo;
    constructor(sessionRepo) {
        this.sessionRepo = sessionRepo;
    }
    async processMessage(userId, messagePayload) {
        console.log('Processing message:', messagePayload);
        try {
            let session = await this.sessionRepo.getSession(userId, messagePayload);
            const defaultMessage = "Lo siento, parece que no puedo ayudarte con eso.\n🔎 ¿Qué repuesto necesitas para tu auto?\n🚘 Debes incluir Marca, Modelo y Año";
            const greetingMessage = "💁‍♂️ ¡Hola! Bienvenido a QuienTiene.com.\n\n*El repuesto ideal sin complicaciones.*\n\n🔎 ¿Qué repuesto necesitas para tu auto?\n🚘 Debes incluir Marca, Modelo y Año\n🗣️ Puedes enviar un mensaje de voz.";
            console.log('Session Backend:', session);
            switch (messagePayload.state) {
                case 'GREETING':
                    if (session.currentState === 'NEW') {
                        return greetingMessage;
                    }
                    else {
                        if (session.data.pending_data) {
                            return `Tu búsqueda de *${session.data.part_name}* está en proceso.\nPuedes agregar información para mejorar los resultados.\nTienes que enviar los siguientes datos:\n*${session.data.pending_data.join('\n')}*.`;
                        }
                        else {
                            return `Tu búsqueda de ${session.data.part_name} está en proceso. ¿En qué más puedo ayudarte?`;
                        }
                    }
                case 'PARSE_REQUEST':
                    session = await this.sessionRepo.createSession(session.userId, messagePayload);
                    return ``;
                case 'COLLECT_DATA':
                    await this.sessionRepo.updateSession(session, messagePayload);
                    return "";
                    break;
                case 'COMMENT':
                    return "Su comentartio será revisado por un moderador";
                    break;
                case 'UNPLEASANT':
                    return "Su comentario ha sido marcado como inapropiado, corre el riesgo de ser bloqueado";
                    break;
                case 'NO_REPLACEMENT':
                    return defaultMessage;
                    break;
            }
            // await this.sessionRepo.updateSession(session);
            return defaultMessage;
        }
        catch (error) {
            logger_1.default.error(`Failed to process message for user ${userId}:`, error);
            throw error;
        }
    }
    handleRequest(state, request) {
        return {
            state: state,
            request: {
                part_name: request.data.replacement,
                part_brand: request.data.brand,
                part_model: request.data.model,
                part_year: request.data.year,
                part_image: request.data.image,
            }
        };
    }
};
exports.ChatEngine = ChatEngine;
exports.ChatEngine = ChatEngine = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ISessionRepository')),
    __metadata("design:paramtypes", [Object])
], ChatEngine);
