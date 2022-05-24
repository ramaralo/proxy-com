import { ApiService } from "./apiService/ApiService";
import { ApiProxy } from "./apiProxy/ApiProxy";
import { IExposeApiOptions } from "./model/IExposeApiOptions";
import { ICreateProxyOptions } from "./model/ICreateProxyOptions";

const exposeApi = ({ apiConfig, api, transport }: IExposeApiOptions) => {
  const apiService = new ApiService(apiConfig, api);
  // @ts-ignore
  apiService.setOutboundFn(new transport(apiService.getInboundFn()).outboundFn);

  // TODO: should allow for destroy?
};

const createProxy = ({ apiConfig, transport }: ICreateProxyOptions) => {
  const apiProxy = new ApiProxy(apiConfig);
  // @ts-ignore
  apiProxy.setOutboundFn(new transport(apiProxy.getInboundFn()).outboundFn);

  return apiProxy.get();
};

export const proxycom = {
  exposeApi,
  createProxy,
};
