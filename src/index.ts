import {IApiConfig} from "./model/IApiConfig";
import {ApiService} from "./apiService/ApiService";
import {ApiProxy} from "./apiProxy/ApiProxy";

const exposeApi = (apiConfig: IApiConfig, api: Record<string, Function>, Transport: Object) => {
    const apiService =  new ApiService(apiConfig, api);
    // @ts-ignore
    apiService.setOutboundFn(new Transport(apiService.getInboundFn()).outboundFn);

    // TODO: allow for destroy
};

const createProxy = (apiConfig: IApiConfig, Transport: Object) => {
    console.log("creating proxy...");

    const apiProxy = new ApiProxy(apiConfig);
    // @ts-ignore
    apiProxy.setOutboundFn(new Transport(apiProxy.getInboundFn()).outboundFn);

    return apiProxy.get();
}


export const proxycom = {
    exposeApi,
    createProxy
}
