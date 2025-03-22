"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RubyOnRailsBackend = void 0;
const axios_1 = __importDefault(require("axios"));
class RubyOnRailsBackend {
    url;
    constructor(options) {
        this.url = options.url;
    }
    async saveRequest(request) {
        try {
            const backendRequestResponse = await axios_1.default.get(`${this.url}/api/v1/requests?q[user_phone_eq]=${request.user_phone}`);
            console.log("backendRequestResponse:", backendRequestResponse.data);
            let response = null;
            if (backendRequestResponse.data.length > 0) {
                response = await axios_1.default.put(`${this.url}/api/v1/requests/${backendRequestResponse.data[0].id}`, {
                    request: request,
                });
            }
            else {
                response = await axios_1.default.post(`${this.url}/api/v1/requests`, {
                    request: request,
                });
            }
            console.log(response.data);
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.RubyOnRailsBackend = RubyOnRailsBackend;
