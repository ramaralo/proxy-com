import proxycom from "../src/index";
import {IApiConfig} from "../src/model/IApiConfig";
import {EventEmitter} from "events";
import {IRequestPayload} from "../src/model/IRequestPayload";
import {IResponsePayload} from "../src/model/IResponsePayload";

describe("public api", function () {
    let transporter: EventEmitter;
    const apiConfig: IApiConfig = {
        props: {
            foo: true,
            bar: true
        }
    };
    const barResult = 123;

    const service = {
        foo: (): void => null,
        bar: () => barResult
    };

    const enum TRANSPORTER_MESSAGES_ENUM {
        MESSAGE_FROM_SERVICE = "messageFromService",
        MESSAGE_FROM_PROXY = "messageFromProxy"
    }

    function getTransportAdapterForService(transporterAdaptee: EventEmitter) {
        return class TransportAdapter {
            constructor(inboundFn: (payload: IRequestPayload) => void) {
                transporterAdaptee.on("messageFromProxy", inboundFn);
            }

            public outboundFn(payload: IResponsePayload) {
                transporterAdaptee.emit("messageFromService", payload);
            }
        }
    }

    function getTransportAdapterForProxy(transporterAdaptee: EventEmitter) {
        return class TransportAdapter {
            constructor(inboundFn: (payload: IResponsePayload) => void) {
                transporterAdaptee.on(TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_SERVICE, inboundFn);
            }

            public outboundFn(payload: IResponsePayload) {
                transporterAdaptee.emit(TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_PROXY, payload);
            }
        }
    }

    beforeEach(function () {
        transporter = new EventEmitter();
    });

    afterEach(function () {
        jest.resetAllMocks();
    });

    describe("when creating a proxy to an exposed api", function () {
        it("should return a proxy api", function () {
            proxycom.exposeApi(apiConfig, service, getTransportAdapterForService(transporter));

            const proxy = proxycom.createProxy(apiConfig, getTransportAdapterForProxy(transporter));

            expect(proxy).toHaveProperty("foo");
        });

        describe("when calling a method on the proxy", function () {
            beforeEach(function () {
                jest.spyOn(service, "foo");
            });

            it("should call the corresponding method on the exposed api", function () {
                proxycom.exposeApi(apiConfig, service, getTransportAdapterForService(transporter));

                const proxy = proxycom.createProxy(apiConfig, getTransportAdapterForProxy(transporter));

                const args = [1, true];

                proxy.foo(...args);

                expect(service.foo).toHaveBeenCalledWith(...args);
            });
        });

        describe("when calling a method on the proxy that should return a value", function () {
            it("should return tha value from the service", async function () {
                proxycom.exposeApi(apiConfig, service, getTransportAdapterForService(transporter));

                const proxy = proxycom.createProxy(apiConfig, getTransportAdapterForProxy(transporter));

                const result = await proxy.bar();

                expect(result).toEqual(barResult);
            });
        });
    });
});
