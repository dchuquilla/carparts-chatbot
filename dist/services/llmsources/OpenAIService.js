"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const axios_1 = __importDefault(require("axios"));
const openai_1 = __importDefault(require("openai"));
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("../../config"));
const openai = new openai_1.default({
    apiKey: config_1.default.openai.apiKey,
});
class OpenAIService {
    async parseMessage(input) {
        try {
            const payload = await new Promise((resolve, reject) => {
                openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "Eres un experto en JSON. Por favor crea un objeto JSON siguiendo estas reglas" },
                        { role: "system", content: "ESTRUCTURA: {\"message\": \"PARSE_REQUEST\",\"request\": { \"replacement\": \"string\", \"brand\": \"string\", \"model\": \"string\", \"year\": \"string\" }}." },
                        { role: "system", content: "SALUDO: Cuando el texto sea un saludo sin informacion de alguna solicitud, responde con {\"message\": \"GREETING\"}" },
                        { role: "system", content: "EXCEPTION: Cuando el texto no sea un saludo o una solicitud de repuesto, responde con {\"message\": \"NO_REPLACEMENT\"}" },
                        {
                            role: "user",
                            content: input,
                        },
                    ],
                }).then(resolve).catch(reject);
            });
            const requestPayload = JSON.parse(payload.choices[0].message.content);
            return requestPayload;
        }
        catch (error) {
            console.log("Error: ", error);
            return { message: "ERROR_CREATE_REQUEST" };
        }
    }
    async transcribeAudio(input) {
        console.log("Transcribing audio: ", input.link, input.id);
        const url = input.link;
        const filePath = `./files/${input.id}.ogg`;
        // Download the file
        const response = await (0, axios_1.default)({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        // Save the file locally
        const writer = fs_1.default.createWriteStream(filePath);
        response.data.pipe(writer);
        // Wait for the file to be fully written
        await new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(undefined));
            writer.on('error', reject);
        });
        // Send audio to OpenAI and transcribe
        const transcription = await openai.audio.transcriptions.create({
            file: fs_1.default.createReadStream(filePath),
            model: "whisper-1",
        });
        console.log("Transcription: ", transcription.text);
        return transcription.text;
    }
}
exports.OpenAIService = OpenAIService;
