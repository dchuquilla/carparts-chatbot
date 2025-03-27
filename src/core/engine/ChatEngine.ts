import logger from "../../infrastructure/shared/logger";
import { injectable, inject } from 'tsyringe';
import { ISessionRepository } from "../session/interfaces/ISessionRepository";
import { type RequestPayload } from "../messaging/WhatsAppTypes";
import { Session } from "../session/Session";
import { StateName } from "../states/StateTypes";

const greetingMessage = `👋 ¡Hola! Bienvenido a [QuienTiene.com](https://QuienTiene.com).
🛠️ *El repuesto ideal sin complicaciones.*`;

const instructionsMessage = `Para ayudarte mejor, envía tu solicitud *en un solo mensaje* con:
🔹 *Tipo de repuesto* (Ejemplo: retrovisor, batería, etc.)
🔹 *Marca y modelo* del vehículo (Ejemplo: Great Wall Wingle Steed)
🔹 *Año* del vehículo

📸 *Opcional:* Puedes adjuntar una *foto del repuesto* o enviar un *mensaje de voz* describiéndolo.

🚀 ¡Tu solicitud será enviada rápidamente a los proveedores de repuestos!`;

@injectable()
export class ChatEngine {
  constructor(
    @inject('ISessionRepository') private sessionRepo: ISessionRepository,
  ) { }

  async processMessage(userId: string, messagePayload: RequestPayload): Promise<string> {
    console.log('Processing message:', messagePayload);
    try {
      let session = await this.sessionRepo.getSession(userId, messagePayload);
      const defaultMessage = "Lo siento, parece que no puedo ayudarte con eso.\n\n" + instructionsMessage;

      console.log('Session Backend:', session);
      switch (messagePayload.state) {
        case 'GREETING':
          if (session.currentState === 'NEW') {
            return greetingMessage + '\n\n' + instructionsMessage;
          } else {
            if (session.data.pending_data) {
              return `Tu búsqueda de *${session.data.part_name}* está en proceso.\nPuedes agregar información para mejorar los resultados.\nTienes que enviar los siguientes datos:\n*${session.data.pending_data.join('\n')}*.`;
            } else {
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

    } catch (error) {
      logger.error(`Failed to process message for user ${userId}:`, error);
      throw error;
    }
  }

  handleRequest(state: StateName, request: Session): RequestPayload {
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
}
