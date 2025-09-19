import logger from "../../infrastructure/shared/logger";
import { injectable, inject } from 'tsyringe';
import { ISessionRepository } from "../session/interfaces/ISessionRepository";
import { type RequestPayload } from "../messaging/WhatsAppTypes";
import { Session } from "../session/Session";
import { StateName } from "../states/StateTypes";
import config from '../../config';

const greetingMessage = `👋 ¡Hola! Bienvenido a QuienTiene.com.
🛠️ *El repuesto ideal sin complicaciones.*`;

const instructionsMessage = `Pide tu repuesto *en un solo mensaje* con:
🔹 *Tipo de repuesto*
🔹 *Marca y modelo* del vehículo
🔹 *Año* del vehículo

💡 EJEMPLO: Amortiguador para Toyota Corolla 2015

📸 *Opcional:* Puedes adjuntar una *foto del repuesto* o enviar un *mensaje de voz* describiéndolo.

🚀 ¡Tu solicitud será enviada rápidamente a los proveedores de repuestos!`;

const pendingDateMessage = (session: Session) => `Tu búsqueda de *${session.data.part_name.toUpperCase()}* está en proceso. Para mejorar los resultados, envía:

🔹 *${session.data.pending_data.join('*\n🔹 *')}*.
`;


@injectable()
export class ChatEngine {
  constructor(
    @inject('ISessionRepository') private sessionRepo: ISessionRepository,
  ) { }

  async processMessage(userId: string, messagePayload: RequestPayload): Promise<string> {
    console.log('Processing message:', messagePayload);
    try {
      let session = await this.sessionRepo.getSession(userId, messagePayload);
      const defaultMessage = "Lo siento, no reconozco un pedido de repuesto en tu mensaje.\n\n" + instructionsMessage;

      console.log('Session Backend:', session);
      switch (messagePayload.state) {
        case 'GREETING':
          if (session.currentState === 'NEW') {
            return greetingMessage + '\n\n' + instructionsMessage;
          } else {
            console.log('***** Existing session, skipping greeting.', session.data);
            if (session.data.length > 0) {
              return pendingDateMessage(session);
            } else {
              return `Tu búsqueda de *${session.data.part_name.toUpperCase()}* está en proceso. Nuestra red de proveedores está trabajando para enviarte propuestas.\n\n${config.web.url}/requests/${session.data.show_key}`;
            }
          }
        case 'PARSE_REQUEST':
          if (session.currentState === 'NEW') {
            session = await this.sessionRepo.createSession(session.userId, messagePayload);
            return ``;
          } else {
            return `Tienes una solicitud pendiente. Por favor espera a que un proveedor te contacte.\n\n${config.web.url}/requests/${session.data.show_key}`;
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
          } else if (session.data.pending_data.length > 0) {
            return pendingDateMessage(session);
          } else {
            return `Tu mensaje no contiene una solicitud válida.\n\n` + instructionsMessage;
          }
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
