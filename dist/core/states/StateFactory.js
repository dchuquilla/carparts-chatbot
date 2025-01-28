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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateFactory = void 0;
const tsyringe_1 = require("tsyringe");
const GreetingState_1 = require("./GreetingState");
const ParseRequestState_1 = require("./ParseRequestState");
const CollectDataState_1 = require("./CollectDataState");
const SearchState_1 = require("./SearchState");
const ConfirmationState_1 = require("./ConfirmationState");
let StateFactory = class StateFactory {
    StateDependencies;
    states = {
        GREETING: GreetingState_1.GreetingState,
        PARSE_REQUEST: ParseRequestState_1.ParseRequestState,
        COLLECT_DATA: CollectDataState_1.CollectDataState,
        SEARCH: SearchState_1.SearchState,
        CONFIRMATION: ConfirmationState_1.ConfirmationState
    };
    constructor(StateDependencies) {
        this.StateDependencies = StateDependencies;
    }
    create(stateName) {
        const StateClass = this.states[stateName];
        if (!StateClass) {
            throw new Error(`Invalid state: ${stateName}`);
        }
        // Use dependency injection container to resolve dependencies
        return tsyringe_1.container.resolve(StateClass);
    }
};
exports.StateFactory = StateFactory;
exports.StateFactory = StateFactory = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('stateDependencies')),
    __metadata("design:paramtypes", [Object])
], StateFactory);
