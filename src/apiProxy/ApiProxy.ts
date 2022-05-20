import { randomUUID } from "../utils/crypto";
import {IApiConfig} from "../model/IApiConfig";
import {IApiProxy} from "../model/IApiProxy";
import {IRequestPayload} from "../model/IRequestPayload";
import {IResponsePayload, IResponsePayloadEnum} from "../model/IResponsePayload";

type outboundFn = (payload: IRequestPayload) => void;

export class ApiProxy {
    private proxy: IApiProxy = {};
    private outboundFn: outboundFn;
    private promiseMap = new Map<string, {res: Function, rej: Function}>();

    constructor(apiConfig: IApiConfig) {
        const {name} = apiConfig;

        for (const prop of apiConfig.props) {
            this.proxy[prop] = (...args: unknown[]): Promise<void> => {

                const uuid = randomUUID();

                return new Promise((res, rej) => {

                    this.promiseMap.set(uuid, {
                        res,
                        rej
                    });

                    this.getOutboundFn()({
                        name,
                        uuid,
                        propertyToCall: prop,
                        args
                    });

                });
            }
        }
    }

    private getOutboundFn() {
        return this.outboundFn;
    }

    get (): IApiProxy {
        return this.proxy;
    }

    getInboundFn() {
        return (payload: IResponsePayload) => {
            if(this.promiseMap.has(payload.uuid)) {
                switch (payload.type) {
                    case IResponsePayloadEnum.ERROR:
                        this.promiseMap.delete(payload.uuid);
                        throw new Error(payload.returnValue as string);
                        break;
                    case IResponsePayloadEnum.REJECTED:
                        this.promiseMap.get(payload.uuid).rej(payload.returnValue);
                        this.promiseMap.delete(payload.uuid);
                        break;
                    case IResponsePayloadEnum.RESOLVED:
                        this.promiseMap.get(payload.uuid).res(payload.returnValue);
                        this.promiseMap.delete(payload.uuid);
                }
            }
        }
    }

    setOutboundFn(outboundFn: outboundFn) {
        this.outboundFn = outboundFn;
    }
}
