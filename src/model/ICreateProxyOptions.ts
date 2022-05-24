import { IApiConfig } from "./IApiConfig";
import { ITransportConstructor } from "./ITransport";

export interface ICreateProxyOptions {
  apiConfig: IApiConfig;
  transport: ITransportConstructor;
}
