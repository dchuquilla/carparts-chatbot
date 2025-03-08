import axios from 'axios';
import { IBackendRepository } from '../interfaces/IBackendRepository';
import { RequestPayload } from '../../core/request/RequestTypes';

interface RubyOnRailsConnectionOptions {
  url: string;
}

export class RubyOnRailsBackend implements IBackendRepository {
  private readonly url: string;

  constructor(options: RubyOnRailsConnectionOptions) {
    this.url = options.url;
  }

  async saveRequest(request: RequestPayload): Promise<void> {
    try {
      const response = await axios.post(`${this.url}/api/v1/requests`, {
        request: request,
      });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }
}
