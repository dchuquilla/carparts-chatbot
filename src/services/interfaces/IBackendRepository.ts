import { RequestPayload } from "../../core/request/RequestTypes";

export interface IBackendRepository {
  saveRequest(request: RequestPayload): Promise<void>;
}
