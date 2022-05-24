import { IRequestPayload } from "./IRequestPayload";
import { IResponsePayload } from "./IResponsePayload";

/**
 * The constructor interface.
 *
 * A Transport can be implemented with a class or a function as it will be called with the new keyword.
 * Typically, you will need a Transport for the exposed API and a Transport for the Proxy.
 *
 * A Transport is a constructor that:
 * - takes an inbound function as an argument
 * - exposes an outbound function
 *
 * Inbound and outbound functions
 * When a method is called on a proxy, Proxy-com creates a payload object that represents the method that is to be called
 * on the API. This payload needs to get to the context where the API is running. This is done through the outbound
 * function on the Transport for the Proxy side and then through the inbound function on the Transport for exposed api.
 * When the API returns, it does the same. Creates a payload that will leave the Transport on the API side through the
 * outbound function and enters the Proxy side via the inbound function.
 *
 * A Transport is then a constructor that takes an inbound function as an argument, and exposes an outbound function.
 *
 * @see {processTransport} for an example of a Transport implementation
 *
 *
 */
export interface ITransportConstructor {
  new (
    inboundFn: (payload: IRequestPayload | IResponsePayload) => void
  ): ITransport;
}

export interface ITransport {
  outboundFn: (payload: IRequestPayload | IResponsePayload) => void;
}
