import proxycom from "../src/index";
import {IApiConfig} from "../src/model/IApiConfig";
import {EventEmitter} from "events";
import {IRequestPayload} from "../src/model/IRequestPayload";

describe("public api", function () {
    afterEach(function () {
        jest.resetAllMocks();
    });

    describe("when creating a proxy to an exposed api", function () {
        let transp: EventEmitter;
        const apiConfig: IApiConfig = {
            name: "someService",
            transport: "",
            props: {
                foo: true
            }
        };
        const service = {
            foo: (): void => null
        };

        beforeEach(function () {
            transp = new EventEmitter();
        });

        it("should return a proxy api", function () {
            proxycom.exposeApi(apiConfig, service);

            const proxy = proxycom.createProxy(apiConfig, (payload): void => {
                // emit
                transp.emit("proxy->service", payload);
            });

            expect(proxy).toHaveProperty("foo");
        });

        describe("when calling a method on the proxy", function () {
            const transp = new EventEmitter();

            const apiConfig: IApiConfig = {
                name: "someService",
                transport: "",
                props: {
                    foo: true
                }
            };


            beforeEach(function () {
                jest.spyOn(service, "foo");
            });

            it("should call the corresponding method on the exposed api", function () {
                const inbound = proxycom.exposeApi(apiConfig, service);

                transp.on("messageFromProxy", inbound);

                const proxy = proxycom.createProxy(apiConfig, (payload): void => {
                    // emit
                    transp.emit("messageFromProxy", payload);
                });

                proxy.foo(1, 2);

                expect(service.foo).toHaveBeenCalledWith(1, 2);
            });
        });
    });
});
