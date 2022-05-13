import { randomUUID } from "../utils/crypto";
import {IApiConfig} from "../model/IApiConfig";
import {IApiProxy} from "../model/IApiProxy";
import {IRequestPayload} from "../model/IRequestPayload";
import {IResponsePayload} from "../model/IResponsePayload";

type outboundFn = (payload: IRequestPayload) => void;

export class ApiProxy {
    private proxy: IApiProxy = {};
    private outboundFn: outboundFn;

    private promiseMap = new Map<string, {res: Function, rej: Function}>();

    constructor(apiConfig: IApiConfig) {
        for (const prop of apiConfig.props) {
            this.proxy[prop] = (...args: unknown[]): Promise<void> => {

                const uuid = randomUUID();

                return new Promise((res, rej) => {

                    this.promiseMap.set(uuid, {
                        res,
                        rej
                    });

                    this.getOutboundFn()({
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
            //TODO: see how to reject
            //TODO: should remove promise from map?
            if(this.promiseMap.has(payload.uuid)) {
                this.promiseMap.get(payload.uuid).res(payload.returnValue);
            }
        }
    }

    setOutboundFn(outboundFn: outboundFn) {
        this.outboundFn = outboundFn;
    }
}
