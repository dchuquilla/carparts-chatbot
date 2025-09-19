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
const config_1 = __importDefault(require("../../config"));
const greetingMessage = `👋 ¡Hola! Bienvenido a QuienTiene.com.
🛠️ *El repuesto ideal sin complicaciones.*`;
const instructionsMessage = `Pide tu repuesto *en un solo mensaje* con:
🔹 *Tipo de repuesto*
🔹 *Marca y modelo* del vehículo
🔹 *Año* del vehículo

💡 EJEMPLO: Amortiguador para Toyota Corolla 2015

📸 *Opcional:* Puedes adjuntar una *foto del repuesto* o enviar un *mensaje de voz* describiéndolo.

🚀 ¡Tu solicitud será enviada rápidamente a los proveedores de repuestos!`;
const pendingDateMessage = (session) => `Tu búsqueda de *${session.data.part_name.toUpperCase()}* está en proceso. Para mejorar los resultados, envía:

🔹 *${session.data.pending_data.join('*\n🔹 *')}*.
`;
let ChatEngine = class ChatEngine {
    sessionRepo;
    constructor(sessionRepo) {
        this.sessionRepo = sessionRepo;
    }
    async processMessage(userId, messagePayload) {
        console.log('Processing message:', messagePayload);
        try {
            let session = await this.sessionRepo.getSession(userId, messagePayload);
            const defaultMessage = "Lo siento, no reconozco un pedido de repuesto en tu mensaje.\n\n" + instructionsMessage;
            console.log('Session Backend:', session);
            switch (messagePayload.state) {
                case 'GREETING':
                    if (session.currentState === 'NEW') {
                        return greetingMessage + '\n\n' + instructionsMessage;
                    }
                    else {
                        console.log('***** Existing session, skipping greeting.', session.data);
                        if (session.data.length > 0) {
                            return pendingDateMessage(session);
                        }
                        else {
                            return `Tu búsqueda de *${session.data.part_name.toUpperCase()}* está en proceso. Nuestra red de proveedores está trabajando para enviarte propuestas.\n\n${config_1.default.web.url}/requests/${session.data.show_key}`;
                        }
                    }
                case 'PARSE_REQUEST':
                    if (session.currentState === 'NEW') {
                        session = await this.sessionRepo.createSession(session.userId, messagePayload);
                        return ``;
                    }
                    else {
                        return `Tienes una solicitud pendiente. Por favor espera a que un proveedor te contacte.\n\n${config_1.default.web.url}/requests/${session.data.show_key}`;
                    }
                case 'COLLECT_DATA':
                    await this.sessionRepo.updateSession(session, messagePayload);
                    return "";
                case 'COMMENT':
                    return "Su comentario será tomado en cuenta.";
                case 'UNPLEASANT':
                    return "Su comentario ha sido marcado como inapropiado.";
                case 'NO_REPLACEMENT':
                    if (session.currentState === 'NEW') {
                        return defaultMessage;
                    }
                    else if (session.data.pending_data.length > 0) {
                        return pendingDateMessage(session);
                    }
                    else {
                        return `Tu mensaje no contiene una solicitud válida.\n\n` + instructionsMessage;
                    }
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
