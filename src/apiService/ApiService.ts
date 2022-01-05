import {IApiConfig} from "../model/IApiConfig";
import {IRequestPayload} from "../model/IRequestPayload";

export class ApiService {
    constructor(apiConfig: IApiConfig, private api: Record<string, Function>) {
    }

    getInboundFn() {
        return (payload: IRequestPayload) => {
            const {propertyToCall, args} = payload;
            this.api[propertyToCall](...args);
        }
    }
}
