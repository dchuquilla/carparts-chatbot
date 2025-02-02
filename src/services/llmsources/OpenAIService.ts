import axios from "axios";
import OpenAI from "openai";
import fs from "fs";
import config from "../../config";
import { ILLMStrategy } from "../interfaces/ILLMStrategy";
import { AudioMessage, MessageType, RequestPayload, type IncomingMessage, type OutgoingMessage } from "../../core/messaging/WhatsAppTypes";

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export class OpenAIService implements ILLMStrategy {
  async parseMessage(input: string): Promise<RequestPayload> {
    try {
      const payload: any = await new Promise((resolve, reject) => {
        openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Eres un experto en JSON. Por favor crea un objeto JSON siguiendo estas reglas" },
          { role: "system", content: "ESTRUCTURA: {\"message\": \"PARSE_REQUEST\",\"request\": { \"replacement\": \"string\", \"brand\": \"string\", \"model\": \"string\", \"year\": \"string\" }}." },
          { role: "system", content: "SALUDO: Cuando el texto sea un saludo sin informacion de alguna solicitud, responde con {\"message\": \"GREETING\"}" },
          { role: "system", content: "EXCEPTION: Cuando el texto no sea un saludo o una solicitud de repuesto, responde con {\"message\": \"not_replacement_request\"}" },
          {
          role: "user",
          content: input,
          },
        ],
        }).then(resolve).catch(reject);
      });
      const requestPayload = JSON.parse(payload.choices[0].message.content);
      return requestPayload
    } catch (error) {
      console.log("Error: ", error)
      return { message: "error_create_payload" }
    }
  }

  async transcribeAudio(input: AudioMessage): Promise<string> {
    console.log("Transcribing audio: ", input.link, input.id);
    const url = input.link;
    const filePath = `./files/${input.id}.ogg`;

    // Download the file
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    // Save the file locally
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    // Wait for the file to be fully written
    await new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(undefined));
        writer.on('error', reject);
    });

    // Send audio to OpenAI and transcribe
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    console.log("Transcription: ", transcription.text)
    return transcription.text;
  }
}
