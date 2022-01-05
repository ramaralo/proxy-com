import {IApiConfig} from "../model/IApiConfig";
import {IApiProxy} from "../model/IApiProxy";
import {IRequestPayload} from "../model/IRequestPayload";

export class ApiProxy {
    private proxy: IApiProxy = {};

    constructor(apiConfig: IApiConfig, outboundFn: (payload: IRequestPayload) => void) {
        for (const prop in apiConfig.props) {
            this.proxy[prop] = (...args: unknown[]): void => {

                outboundFn({
                    propertyToCall: prop,
                    args
                });

            }
        }
    }

    get (): IApiProxy {
        return this.proxy;
    }
}
