import {IResponsePayload, IResponsePayloadEnum} from "../model/IResponsePayload";
import {IApiProxy} from "../model/IApiProxy";

const cryptoMock = {
    randomUUID: jest.fn()
}
jest.mock("../utils/crypto", () => cryptoMock);
const {ApiProxy} = require("./ApiProxy");

describe("ApiProxy", function () {
    const MOCKED_UUID = "123";

    beforeEach(function () {
        cryptoMock.randomUUID.mockReturnValue(MOCKED_UUID);
    })

    afterEach(() => {
        jest.restoreAllMocks();
    })

    describe("getInboundFn()", function () {
        it("Should return a function", function () {
            const proxy = new ApiProxy({
                props: []
            });

            expect(typeof proxy.getInboundFn()).toEqual("function");
        })
    })

    describe("When returned function is called", function () {
        let inboundFn: (payload: IResponsePayload) => void;
        let proxy: IApiProxy;
        let outboundFn: typeof jest.fn;
        let promiseResult: Promise<unknown>;


        beforeEach(function () {
            const proxyInstance = new ApiProxy({
                props: ["foo"]
            });

            outboundFn = jest.fn();
            
            inboundFn = proxyInstance.getInboundFn();
            proxy = proxyInstance.get();
            proxyInstance.setOutboundFn(outboundFn);

            promiseResult = proxy.foo(); // needed to create a known uuid (mocked) for later usage on payload
        });

        describe("When called with an error payload", function () {
            it("Should throw an error", function () {

                expect(() => {
                    inboundFn({
                        type: IResponsePayloadEnum.ERROR,
                        uuid: MOCKED_UUID,
                        returnValue: new Error("some error")
                    })
                }).toThrow("some error");
            })
        })

        describe("When called with a rejected payload", function () {
            it("Should reject the promise", async function () {
                inboundFn({
                    type: IResponsePayloadEnum.REJECTED,
                    uuid: MOCKED_UUID,
                    returnValue: "rejected"
                })

                await expect(promiseResult).rejects.toMatch("rejected");
            })
        })

        describe("When called with a resolved payload", function () {
            it("Should resolve the promise", async function () {
                inboundFn({
                    type: IResponsePayloadEnum.RESOLVED,
                    uuid: MOCKED_UUID,
                    returnValue: "resolved"
                })

                await expect(promiseResult).resolves.toMatch("resolved");
            })
        })
    })
})