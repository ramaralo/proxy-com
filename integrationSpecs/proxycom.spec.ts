import { proxycom } from "../src";
import { IApiConfig } from "../src/model/IApiConfig";
import { EventEmitter } from "events";
import { IRequestPayload } from "../src/model/IRequestPayload";
import { IResponsePayload } from "../src/model/IResponsePayload";
import { IApiProxy } from "../src/model/IApiProxy";
import { ITransportConstructor } from "../src/model/ITransport";

describe("public api", function () {
  const barResult = 123;
  let transporter: EventEmitter;

  const api_one = {
    foo: (): void => {
      return null;
    },
    bar: () => {
      return barResult;
    },
    reject: () => {
      return Promise.reject("rejected");
    },
    resolve: () => {
      return Promise.resolve("resolved");
    },
    error: () => {
      throw new Error("some error");
    },
  };

  const api_two = {
    foo: (): void => {
      return null;
    },
  };

  const apiConfig: IApiConfig = {
    name: "configForService",
    props: Object.keys(api_one),
  };

  const enum TRANSPORTER_MESSAGES_ENUM {
    MESSAGE_FROM_SERVICE = "messageFromService",
    MESSAGE_FROM_PROXY = "messageFromProxy",
  }

  function getTransportAdapterForService(
    transporterAdaptee: EventEmitter
  ): ITransportConstructor {
    return class TransportAdapter {
      constructor(inboundFn: (payload: IRequestPayload) => void) {
        transporterAdaptee.on(
          TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_PROXY,
          inboundFn
        );
      }

      public outboundFn(payload: IResponsePayload) {
        transporterAdaptee.emit(
          TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_SERVICE,
          payload
        );
      }
    };
  }

  function getTransportAdapterForProxy(
    transporterAdaptee: EventEmitter
  ): ITransportConstructor {
    return class TransportAdapter {
      constructor(inboundFn: (payload: IResponsePayload) => void) {
        transporterAdaptee.on(
          TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_SERVICE,
          inboundFn
        );
      }

      public outboundFn(payload: IResponsePayload) {
        transporterAdaptee.emit(
          TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_PROXY,
          payload
        );
      }
    };
  }

  beforeEach(function () {
    transporter = new EventEmitter();
  });

  afterEach(function () {
    jest.resetAllMocks();
  });

  describe("USE CASE: Proxy and service matching api behaviour", function () {
    describe("When a transport receives an unknown message", function () {
      it("Should not throw errors", function () {
        /*
                The transport may rely on some message passing that is not used exclusively by proxy-com. For example,
                IPC communication can be used by proxy-com and also by any other entity outside its scope. In such cases
                proxy-com may detect a new message, but it should only work if the message contains a known payload
                pointing to a known property on the exposed api. Otherwise, it would throw errors trying to read the payload.
                 */
        proxycom.exposeApi({
          apiConfig,
          api: api_one,
          transport: getTransportAdapterForService(transporter),
        });

        proxycom.createProxy({
          apiConfig,
          transport: getTransportAdapterForProxy(transporter),
        });

        expect(() => {
          return transporter.emit(
            TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_PROXY,
            "this is an unsupported message"
          );
        }).not.toThrowError();

        expect(() => {
          return transporter.emit(
            TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_PROXY,
            {}
          );
        }).not.toThrowError();

        expect(() => {
          return transporter.emit(
            TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_PROXY,
            {
              propertyToCall: "some unknown property",
            }
          );
        }).not.toThrowError();

        expect(() => {
          return transporter.emit(
            TRANSPORTER_MESSAGES_ENUM.MESSAGE_FROM_PROXY,
            {
              propertyToCall: "some unknown property",
              uuid: "some uuid",
            }
          );
        }).not.toThrowError();
      });
    });
    describe("when creating a proxy to an exposed api", function () {
      it("should return a proxy api with the same properties as defined on the config", function () {
        proxycom.exposeApi({
          apiConfig,
          api: api_one,
          transport: getTransportAdapterForService(transporter),
        });

        const proxy = proxycom.createProxy({
          apiConfig,
          transport: getTransportAdapterForProxy(transporter),
        });

        expect(proxy).toHaveProperty("foo");
        expect(proxy).toHaveProperty("bar");
        expect(proxy).toHaveProperty("reject");
        expect(proxy).toHaveProperty("resolve");
        expect(proxy).toHaveProperty("error");
      });

      describe("when calling a method on the proxy", function () {
        beforeEach(function () {
          jest.spyOn(api_one, "foo");
        });

        it("should call the corresponding method on the exposed api", function () {
          proxycom.exposeApi({
            apiConfig,
            api: api_one,
            transport: getTransportAdapterForService(transporter),
          });

          const proxy = proxycom.createProxy({
            apiConfig,
            transport: getTransportAdapterForProxy(transporter),
          });

          const args = [1, true];

          proxy.foo(...args);

          expect(api_one.foo).toHaveBeenCalledWith(...args);
        });
      });

      describe("when calling a method on the proxy that returns a value", function () {
        it("should return the value from the service", async function () {
          proxycom.exposeApi({
            apiConfig,
            api: api_one,
            transport: getTransportAdapterForService(transporter),
          });

          const proxy = proxycom.createProxy({
            apiConfig,
            transport: getTransportAdapterForProxy(transporter),
          });

          const result = await proxy.bar();

          expect(result).toEqual(barResult);
        });
      });

      describe("When calling a method from the service that returns a promise", function () {
        describe("When the promise resolves", function () {
          it("Should resolve on the proxy with the same value", async function () {
            proxycom.exposeApi({
              apiConfig,
              api: api_one,
              transport: getTransportAdapterForService(transporter),
            });

            const proxy = proxycom.createProxy({
              apiConfig,
              transport: getTransportAdapterForProxy(transporter),
            });

            await expect(proxy.resolve()).resolves.toMatch("resolved");
          });
        });

        describe("When the promise rejects", function () {
          it("Should reject on the proxy with the same value", async function () {
            proxycom.exposeApi({
              apiConfig,
              api: api_one,
              transport: getTransportAdapterForService(transporter),
            });

            const proxy = proxycom.createProxy({
              apiConfig,
              transport: getTransportAdapterForProxy(transporter),
            });

            await expect(proxy.reject()).rejects.toMatch("rejected");
          });
        });

        describe("When the service method throws", function () {
          it("Should throw on the proxy with the same value", async function () {
            proxycom.exposeApi({
              apiConfig,
              api: api_one,
              transport: getTransportAdapterForService(transporter),
            });

            const proxy = proxycom.createProxy({
              apiConfig,
              transport: getTransportAdapterForProxy(transporter),
            });

            try {
              await proxy.error();
            } catch (e) {
              expect(e).toEqual(new Error("some error"));
            }
          });
        });
      });
    });
  });

  describe("USE CASE: multiple proxies for the same exposed service", function () {
    let proxy1: IApiProxy;
    let proxy2: IApiProxy;

    beforeEach(function () {
      jest.spyOn(api_one, "foo");

      proxycom.exposeApi({
        apiConfig,
        api: api_one,
        transport: getTransportAdapterForService(transporter),
      });

      proxy1 = proxycom.createProxy({
        apiConfig,
        transport: getTransportAdapterForProxy(transporter),
      });
      proxy2 = proxycom.createProxy({
        apiConfig,
        transport: getTransportAdapterForProxy(transporter),
      });
    });

    it("should return a proxy api with the same properties as defined on the config", function () {
      expect(proxy1).toHaveProperty("foo");
      expect(proxy1).toHaveProperty("bar");

      expect(proxy2).toHaveProperty("foo");
      expect(proxy2).toHaveProperty("bar");
    });

    describe("when calling a prop on each proxy", function () {
      it("should call the property on the service as many times as the proxies", function () {
        proxy1.foo();
        proxy2.foo();

        expect(api_one.foo).toHaveBeenCalledTimes(2);
      });

      describe("When service return value doesn't change", function () {
        it("should return the same values", async function () {
          const result1 = await proxy1.bar();
          const result2 = await proxy2.bar();

          expect(result1).toEqual(barResult);
          expect(result2).toEqual(barResult);
        });
      });

      describe("when service return value changes", function () {
        it("should not affect proxy returned values", async function () {
          const newValue = 4321;

          const result1 = await proxy1.bar();

          jest.spyOn(api_one, "bar").mockImplementation(() => newValue);

          const result2 = await proxy2.bar();

          expect(result1).toEqual(barResult);
          expect(result2).toEqual(newValue);
        });
      });
    });
  });

  describe("GIVEN: Apis api_one and api_two that each have one method called foo", function () {
    const api_one = {
      foo: (): null => null,
    };

    const api_two = {
      foo: (): null => null,
    };

    const apiOneConfig: IApiConfig = {
      name: "apiOne",
      props: ["foo"],
    };

    const apiTwoConfig: IApiConfig = {
      name: "apiTwo",
      props: ["foo"],
    };

    let proxy_one: IApiProxy;
    let proxy_two: IApiProxy;

    beforeEach(function () {
      jest.spyOn(api_two, "foo");

      proxy_one = proxycom.createProxy({
        apiConfig: apiOneConfig,
        transport: getTransportAdapterForProxy(transporter),
      });
      proxy_two = proxycom.createProxy({
        apiConfig: apiOneConfig,
        transport: getTransportAdapterForProxy(transporter),
      });

      proxycom.exposeApi({
        apiConfig: apiOneConfig,
        api: api_one,
        transport: getTransportAdapterForService(transporter),
      });

      proxycom.exposeApi({
        apiConfig: apiTwoConfig,
        api: api_two,
        transport: getTransportAdapterForService(transporter),
      });
    });

    describe("When calling foo() on proxy_one", function () {
      it("Should not call foo() for api_two", async function () {
        await proxy_one.foo();

        expect(api_two.foo).not.toHaveBeenCalled();
      });
    });
  });
});
