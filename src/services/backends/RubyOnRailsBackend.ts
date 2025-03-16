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
      const backendRequestResponse = await axios.get(`${this.url}/api/v1/requests?q[user_phone_eq]=${request.user_phone}`);
      console.log("backendRequestResponse:", backendRequestResponse.data);
      let response = null;
      if (backendRequestResponse.data.length > 0) {
        response = await axios.put(`${this.url}/api/v1/requests/${backendRequestResponse.data[0].id}`, {
          request: request,
        });
      } else {
        response = await axios.post(`${this.url}/api/v1/requests`, {
          request: request,
        });
      }
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  // async updateRequest(request: RequestPayload): Promise<void> {
  //   try {
  //     const backendRequest = await axios.get(`${this.url}/api/v1/requests?q[user_phone_eq]=${request.user_phone}`);
  //     console.log(backendRequest);
  //     const response = await axios.put(`${this.url}/api/v1/requests/${backendRequest[0].id}`, {
  //       request: request,
  //     });
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
}
