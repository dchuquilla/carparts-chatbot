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
                        { role: "system", content: "COMPLEMENTARIO: Cuando el texto sea información adicional con el formato de codigo de 8 caracteeres alfaniméricos para la solicitud de repuesto de auto, responde con {\"state\": \"COLLECT_DATA\",\"request\": { \"part_chassis\": \"string\" }}" },
                        { role: "system", content: "COMENTARIO: Cuando el texto sea un comentario suelto sin relación a solicitar repuestos de auto, responde con {\"state\": \"COMMENT\"}" },
                        { role: "system", content: "INAPROPIADO: Cuando el texto sea un comentario con contenido sexual, insultante o acosador, responde con {\"state\": \"UNPLEASANT\"}" },
                        { role: "system", content: "EXCEPTION: Cuando el texto no sea un saludo, una solicitud de repuesto o un comentario, responde con {\"state\": \"NO_REPLACEMENT\"}" },
                        { role: "system", content: "SALUDO: Cuando el texto sea un saludo sin informacion de alguna solicitud, responde con {\"state\": \"GREETING\"}" },
                        { role: "system", content: "ESTRUCTURA: {\"state\": \"PARSE_REQUEST\",\"request\": { \"part_name\": \"string\", \"part_brand\": \"string\", \"part_model\": \"string\", \"part_year\": \"string\" }}." },
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
            return { state: "ERROR_CREATE_REQUEST" };
        }
    }
    async transcribeAudio(input) {
        try {
            console.log("Transcribing audio: ", input.link, input.id);
            const url = input.link;
            const filePath = `./files/${input.id}.ogg`;
            // Ensure the 'files' directory exists
            if (!fs_1.default.existsSync('./files')) {
                fs_1.default.mkdirSync('./files');
            }
            // Download the file
            const response = await (0, axios_1.default)({
                url,
                method: 'GET',
                responseType: 'stream'
            });
            // Save the file locally
            const writer = fs_1.default.createWriteStream(filePath);
            await response.data.pipe(writer);
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
            console.log("Transcription completed: ", transcription.text);
            // Delete the file after transcription
            fs_1.default.unlinkSync(filePath);
            return transcription.text;
        }
        catch (error) {
            console.log("Transcription Error: ", error);
            return "ERROR_TRANSCRIPTION";
        }
    }
}
exports.OpenAIService = OpenAIService;
