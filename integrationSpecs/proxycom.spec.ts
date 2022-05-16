import {proxycom} from "../src";
import {IApiConfig} from "../src/model/IApiConfig";
import {EventEmitter} from "events";
import {IRequestPayload} from "../src/model/IRequestPayload";
import {IResponsePayload} from "../src/model/IResponsePayload";
import { IApiProxy } from "../src/model/IApiProxy";

describe("public api", function () {
    const barResult = 123;
    let transporter: EventEmitter;
    const apiConfig: IApiConfig = {
        props: ["foo", "bar"]
    };

    const service = {
        foo: (): void => {
            return null;
        },
        bar: () => {
            return barResult;
        }
    };

    const enum TRANSPORTER_MESSAGES_ENUM {
        MESSAGE_FROM_SERVICE = "messageFromService",
        MESSAGE_FROM_PROXY = "messageFromProxy"
    }

    function getTransportAdapterForService(transporterAdaptee: EventEmitter) {
        return class TransportAdapter {
            constructor(inboundFn: (payload: IRequestPayload) => void) {
                transporterAdaptee.on(TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_PROXY, inboundFn);
            }

            public outboundFn(payload: IResponsePayload) {
                transporterAdaptee.emit(TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_SERVICE, payload);
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

    describe("USE CASE: Proxy and service matching api behaviour", function() {
        describe("When a transport receives an unknown message", function () {
            it("Should not throw errors", function () {
                /*
                The transport may rely on some message passing that is not used exclusively by proxy-com. For example,
                IPC communication can be used by proxy-com and also by any other entity outside its scope. In such cases
                proxy-com may detect a new message, but it should only work if the message contains a known payload
                pointing to a known property on the exposed api. Otherwise, it would throw errors trying to read the payload.
                 */
                proxycom.exposeApi(apiConfig, service, getTransportAdapterForService(transporter));

                proxycom.createProxy(apiConfig, getTransportAdapterForProxy(transporter));

                expect(() => {
                    return transporter.emit(TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_PROXY, "this is an unsupported message");
                }).not.toThrowError();

                expect(() => {
                    return transporter.emit(TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_PROXY, {});
                }).not.toThrowError();

                expect(() => {
                    return transporter.emit(TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_PROXY, {
                        propertyToCall: "some unknown property"
                    });
                }).not.toThrowError();

                expect(() => {
                    return transporter.emit(TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_PROXY, {
                        propertyToCall: "some unknown property",
                        uuid: "some uuid"
                    });
                }).not.toThrowError();
            });
        })
        describe("when creating a proxy to an exposed api", function () {
            it("should return a proxy api with the same properties as defined on the config", function () {
                proxycom.exposeApi(apiConfig, service, getTransportAdapterForService(transporter));

                const proxy = proxycom.createProxy(apiConfig, getTransportAdapterForProxy(transporter));

                expect(proxy).toHaveProperty("foo");
                expect(proxy).toHaveProperty("bar");
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

        describe("when calling a method on the proxy that returns a value", function () {
            it("should return the value from the service", async function () {
                proxycom.exposeApi(apiConfig, service, getTransportAdapterForService(transporter));

                const proxy = proxycom.createProxy(apiConfig, getTransportAdapterForProxy(transporter));

                const result = await proxy.bar();

                expect(result).toEqual(barResult);
            });
        });
    });
    })

    describe("USE CASE: multiple proxies for the same exposed service", function() {
        let proxy1: IApiProxy;
        let proxy2: IApiProxy;

        beforeEach(function() {
            jest.spyOn(service, "foo");

            proxycom.exposeApi(apiConfig, service, getTransportAdapterForService(transporter));

            proxy1 = proxycom.createProxy(apiConfig, getTransportAdapterForProxy(transporter));
            proxy2 = proxycom.createProxy(apiConfig, getTransportAdapterForProxy(transporter));
        })

        it("should return a proxy api with the same properties as defined on the config", function () {
            expect(proxy1).toHaveProperty("foo");
            expect(proxy1).toHaveProperty("bar");

            expect(proxy2).toHaveProperty("foo");
            expect(proxy2).toHaveProperty("bar");
        });

        describe("when calling a prop on each proxy", function () {
            it("should call the property on the service as many times as the proxies", function() {
                proxy1.foo();
                proxy2.foo();
    
                expect(service.foo).toHaveBeenCalledTimes(2);
            });

            describe("When service return value doesn't change", function () {
                it("should return the same values", async function() {
                    const result1 = await proxy1.bar();
                    const result2 = await proxy2.bar();

                    expect(result1).toEqual(barResult);
                    expect(result2).toEqual(barResult);
                });
            });

            describe("when service return value changes", function () {
                it("should not affect proxy returned values", async function() {
                    const newValue = 4321;
                    
                    const result1 = await proxy1.bar();

                    jest.spyOn(service, "bar").mockImplementation(() => newValue);

                    const result2 = await proxy2.bar();

                    expect(result1).toEqual(barResult);
                    expect(result2).toEqual(newValue);
                });
            })
        });
    })

    describe("USE CASE: two exposed services with one proxy each", function () {
        let proxy1: IApiProxy;
        let proxy2: IApiProxy;
    })
});
