import { IRequestPayload } from "./IRequestPayload";
import { IResponsePayload } from "./IResponsePayload";

/**
 * The constructor interface.
 *
 * A Transport can be implemented with a class or a function as it will be called with the new keyword.
 * Typically, you will need a Transport for the exposed API and a Transport for the Proxy. Since a Transport will probably
 * depend on the
 */
export interface ITransportConstructor {
  new (
    inboundFn: (payload: IRequestPayload | IResponsePayload) => void
  ): ITransport;
}

export interface ITransport {
  outboundFn: (payload: IRequestPayload | IResponsePayload) => void;
}
