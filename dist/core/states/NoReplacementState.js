"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoReplacementState = void 0;
const tsyringe_1 = require("tsyringe");
let NoReplacementState = class NoReplacementState {
    async handleInput(input, session) {
        // Initial greeting logic
        session.transitionTo('PARSE_REQUEST');
        return session;
    }
    getNextState(session) {
        return 'PARSE_REQUEST';
    }
    getPrompt(session) {
        return '¡Hola! ¿Qué repuesto necesitas para tu vehículo?';
    }
};
exports.NoReplacementState = NoReplacementState;
exports.NoReplacementState = NoReplacementState = __decorate([
    (0, tsyringe_1.injectable)()
], NoReplacementState);
