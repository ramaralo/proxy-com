import {IApiConfig} from "./model/IApiConfig";
import {ApiService} from "./apiService/ApiService";
import {ApiProxy} from "./apiProxy/ApiProxy";

const exposeApi = ({apiConfig, api, transport}: {apiConfig: IApiConfig, api: Record<string, Function>, transport: Object}) => {
    const apiService =  new ApiService(apiConfig, api);
    // @ts-ignore
    apiService.setOutboundFn(new transport(apiService.getInboundFn()).outboundFn);

    // TODO: shold allow for destroy?
};

const createProxy = ({apiConfig, transport}: {apiConfig: IApiConfig, transport: Object}) => {
    const apiProxy = new ApiProxy(apiConfig);
    // @ts-ignore
    apiProxy.setOutboundFn(new transport(apiProxy.getInboundFn()).outboundFn);

    return apiProxy.get();
}


export const proxycom = {
    exposeApi,
    createProxy
}
