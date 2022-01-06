import {IApiConfig} from "../model/IApiConfig";
import {IRequestPayload} from "../model/IRequestPayload";
import {IResponsePayload} from "../model/IResponsePayload";

type outboundFn = (payload: IResponsePayload) => void;

export class ApiService {
    private outboundFn: outboundFn;

    constructor(apiConfig: IApiConfig, private api: Record<string, Function>) {
    }

    private getOutBoundFn(): outboundFn {
        return this.outboundFn;
    }

    getInboundFn()  {
        return (payload: IRequestPayload) => {
            const {propertyToCall, args} = payload;
            const result = this.api[propertyToCall](...args);

            this.getOutBoundFn()({
                uuid: payload.uuid,
                returnValue: result
            });
        }
    }

    setOutboundFn(outboundFn: (payload: IResponsePayload) => void) {
        this.outboundFn = outboundFn;
    }
}
