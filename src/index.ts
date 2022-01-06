import {IApiConfig} from "./model/IApiConfig";
import {ApiService} from "./apiService/ApiService";
import {IRequestPayload} from "./model/IRequestPayload";
import {ApiProxy} from "./apiProxy/ApiProxy";

export default {
    exposeApi(apiConfig: IApiConfig, api: Record<string, Function>, Transport: Object) {
        const apiService =  new ApiService(apiConfig, api);
        // @ts-ignore
        apiService.setOutboundFn(new Transport(apiService.getInboundFn()).outboundFn);

        // TODO: allow for destroy
    },
    createProxy_(apiConfig: IApiConfig, outboundFn: (payload: IRequestPayload) => void) {
        return new ApiProxy(apiConfig).get();
    },
    createProxy(apiConfig: IApiConfig, Transport: Object) {
        const apiProxy = new ApiProxy(apiConfig);
        // @ts-ignore
        apiProxy.setOutboundFn(new Transport(apiProxy.getInboundFn()).outboundFn);

        return apiProxy.get();
    }
}
