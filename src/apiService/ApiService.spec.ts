import {ApiService} from "./ApiService";
import {IApiConfig} from "../model/IApiConfig";

describe("ApiService", function () {
    const createApiService = (config: IApiConfig, api: Record<string, Function>): ApiService => {
        return new ApiService(config, api);
    }

    describe("When instantiated", function () {
        it("Should return the expected api", function () {
            const apiService = createApiService({
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
                    props: []
                },
                {
                    foo: () => {}
                })

            expect(typeof apiService.getInboundFn()).toEqual("function");
        });

        describe("When the returned function is called", function () {
            it("Should call the outbound function", function () {

            })
        })
    })
})