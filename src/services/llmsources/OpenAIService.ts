import axios from "axios";
import OpenAI from "openai";
import fs from "fs";
import config from "../../config";
import { ILLMStrategy } from "../interfaces/ILLMStrategy";
import { AudioMessage, MessageType, RequestPayload, type IncomingMessage, type OutgoingMessage } from "../../core/messaging/WhatsAppTypes";
import { ParseRequestPayload, SearchResultPayload, SearchResultsPayload } from "../../core/messaging/WhatsAppTypes";

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
          { role: "system", content: "EXCEPTION: Cuando el texto no sea un saludo o una solicitud de repuesto, responde con {\"message\": \"NO_REPLACEMENT\"}" },
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
      return { message: "ERROR_CREATE_REQUEST" }
    }
  }

  async transcribeAudio(input: AudioMessage): Promise<string> {
    try {
      console.log("Transcribing audio: ", input.link, input.id);
      const url = input.link;
      const filePath = `./files/${input.id}.ogg`;

      // Ensure the 'files' directory exists
      if (!fs.existsSync('./files')) {
        fs.mkdirSync('./files');
      }

      // Download the file
      const response = await axios({
          url,
          method: 'GET',
          responseType: 'stream'
      });

      // Save the file locally
      const writer = fs.createWriteStream(filePath);
      await response.data.pipe(writer);

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

      console.log("Transcription completed: ", transcription.text);

      // Delete the file after transcription
      fs.unlinkSync(filePath);

      return transcription.text;
    } catch (error) {
      console.log("Transcription Error: ", error)
      return "ERROR_TRANSCRIPTION"

    }
  }

  async searchParts(input: ParseRequestPayload): Promise<SearchResultsPayload> {
    // Create query with OpenAI
        const prompt = `Busca repuestos de autos en Quito, Ecuador.
                        Repuesto: ${input.replacement}, Marca: ${input.brand}, Modelo: ${input.model}, Año: ${input.year}.
                        Formato de salida: {"name":string, "description":string, "price":number, "store":string, "url":string}.
                        descripción de los campos:name: nombre del repuesto, description: descripción del repuesto, price: precio del repuesto, store: tienda donde se vende, url: enlace a la página del repuesto.`;
        const openaiResponse = await openai.completions.create({
          model: "gpt-3.5-turbo-instruct",
          prompt,
          max_tokens: 50,
        });

        const query = openaiResponse.choices[0].text.trim();

        // Use Google Custom Search API
        const googleResponse = await axios.get(
          `https://www.googleapis.com/customsearch/v1`,
          {
            params: {
              key: process.env.GOOGLE_API_KEY,
              cx: process.env.SEARCH_ENGINE_ID,
              q: query,
            },
          }
        );

        // Process results
        const results = googleResponse.data.items.map((item: SearchResultPayload) => item);

        return {message: "SEARCH", results: results};
  }
}
