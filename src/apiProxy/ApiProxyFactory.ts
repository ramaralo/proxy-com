import { IApiConfig } from "../model/IApiConfig";
import { ApiProxy } from "./ApiProxy";
import { IRequestPayload } from "../model/IRequestPayload";

export abstract class ApiProxyFactory {
  static create(
    apiConfig: IApiConfig,
    outboundFn: (payload: IRequestPayload) => void
  ): ApiProxy {
    //TODO: resolve to the right transport to be passed into proxy factory

    return new ApiProxy(apiConfig);
  }
}
