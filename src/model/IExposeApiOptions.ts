import { IApiConfig } from "./IApiConfig";

export interface IExposeApiOptions {
  apiConfig: IApiConfig;
  api: Record<string, Function>;
  transport: Object;
}
