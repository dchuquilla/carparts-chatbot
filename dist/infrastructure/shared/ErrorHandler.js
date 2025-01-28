"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const logger_1 = __importDefault(require("./logger"));
const config_1 = __importDefault(require("../../config"));
class ErrorHandler {
    static handle(error, res) {
        logger_1.default.error('Request failed:', error);
        res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: config_1.default.app.isProduction
                    ? 'An unexpected error occurred'
                    : error.message,
            },
        });
    }
    static middleware() {
        return (error, req, res, next) => {
            ErrorHandler.handle(error, res);
        };
    }
    createError(code, message) {
        return new Error(message || code);
    }
}
exports.ErrorHandler = ErrorHandler;
