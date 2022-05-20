import {ApiService} from "./ApiService";
import {IApiConfig} from "../model/IApiConfig";

describe("ApiService", function () {
    const createApiService = (config: IApiConfig, api: Record<string, Function>): ApiService => {
        return new ApiService(config, api);
    }

    describe("When instantiated", function () {
        it("Should return the expected api", function () {
            const apiService = createApiService({
                    name: "apiService",
                    props: []
                },
                {
                    foo: () => {}
                })

            expect(apiService).toHaveProperty("getInboundFn");
            expect(apiService).toHaveProperty("setOutboundFn");
        })
    })

    describe("getInboundFn()", function () {
        it("Should return a function", function () {
            const apiService = createApiService({
                    name: "apiService",
                    props: []
                },
                {
                    foo: () => {}
                })

            expect(typeof apiService.getInboundFn()).toEqual("function");
        });

        describe("When the returned function is called", function () {
            let apiService: ApiService;
            beforeEach(function () {
                apiService = createApiService({
                        name: "apiService",
                        props: ["foo"]
                    },
                    {
                        foo: () => 123
                    })
            })

            it("Should call the outbound function", async function () {
                const outboundSpy = jest.fn();
                apiService.setOutboundFn(outboundSpy);

                await apiService.getInboundFn()({
                    name: "apiService",
                    propertyToCall: "foo",
                    uuid: "1234",
                    args:  []
                });

                expect(outboundSpy).toHaveBeenCalledWith({
                    type: "resolved",
                    uuid: "1234",
                    returnValue: 123
                });
            })
        })

        describe("When the api method returns a promise", function () {
            let apiService: ApiService;
            beforeEach(function () {
                apiService = createApiService({
                        name: "apiService",
                        props: ["foo"]
                    },
                    {
                        foo: () => Promise.resolve(123)
                    })
            });

            it("The outbound function should be called with the resolved value", async function () {
                const outboundSpy = jest.fn();
                apiService.setOutboundFn(outboundSpy);

                await apiService.getInboundFn()({
                    name: "apiService",
                    propertyToCall: "foo",
                    uuid: "1234",
                    args:  []
                });

                expect(outboundSpy).toHaveBeenCalledWith({
                    type: "resolved",
                    uuid: "1234",
                    returnValue: 123
                });
            })

            describe("When the api method returns a rejected promise", function () {

            })
        })
    })
})