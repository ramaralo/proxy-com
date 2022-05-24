import { IRequestPayload } from "./IRequestPayload";
import { IResponsePayload } from "./IResponsePayload";

export interface ITransportConstructor {
  new (
    inboundFn: (payload: IRequestPayload | IResponsePayload) => void
  ): ITransport;
}

interface ITransport {
  outboundFn: (payload: IRequestPayload | IResponsePayload) => void;
}
