import {IApiConfig} from "./model/IApiConfig";
import {ApiProxyFactory} from "./apiProxy/ApiProxyFactory";
import {ApiService} from "./apiService/ApiService";
import {IRequestPayload} from "./model/IRequestPayload";

export default {
    exposeApi(apiConfig: IApiConfig, api: Record<string, Function>) {
        return new ApiService(apiConfig, api).getInboundFn();
    },
    createProxy(apiConfig: IApiConfig, outboundFn: (payload: IRequestPayload) => void) {
        return ApiProxyFactory.create(apiConfig, outboundFn).get();
    }
}
