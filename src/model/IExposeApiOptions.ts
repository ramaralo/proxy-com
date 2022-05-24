import { IApiConfig } from "./IApiConfig";
import { ITransportConstructor } from "./ITransport";

export interface IExposeApiOptions {
  apiConfig: IApiConfig;
  api: Record<string, Function>;
  transport: ITransportConstructor;
}
