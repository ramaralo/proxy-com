import {IApiConfig} from "../model/IApiConfig";
import {IRequestPayload} from "../model/IRequestPayload";
import {IResponsePayload, IResponsePayloadEnum} from "../model/IResponsePayload";

type outboundFn = (payload: IResponsePayload) => void;

export class ApiService {
    private outboundFn: outboundFn;

    constructor(apiConfig: IApiConfig, private api: Record<string, Function>) {
    }

    private getOutBoundFn(): outboundFn {
        return this.outboundFn;
    }

    private async callApiProp(prop: string, args: unknown[]): Promise<unknown> {
        return this.api[prop](...args);
    }

    getInboundFn(): (payload: IRequestPayload) => void  {
        return async (payload: IRequestPayload) => {
            const {propertyToCall, args, uuid} = payload;
            if(propertyToCall && uuid && (propertyToCall in this.api)) {
                let responsePayload: IResponsePayload = {
                    uuid,
                    type: IResponsePayloadEnum.RESOLVED,
                    returnValue: undefined
                };

                try {
                    await this.callApiProp(propertyToCall, args).then((resolvedValue: unknown) => {
                        responsePayload.type = IResponsePayloadEnum.RESOLVED;
                        responsePayload.returnValue = resolvedValue;
                    }).catch((rejectedValue: unknown) => {
                        responsePayload.type = IResponsePayloadEnum.REJECTED;
                        responsePayload.returnValue = rejectedValue;
                    });
                } catch (e) {
                    const typedError = e as Error;
                    responsePayload.type = IResponsePayloadEnum.ERROR;
                    responsePayload.returnValue = typedError?.message;
                }

                this.getOutBoundFn()(responsePayload);
            }
        }
    }

    setOutboundFn(outboundFn: (payload: IResponsePayload) => void) {
        this.outboundFn = outboundFn;
    }
}
