import { ChildProcess } from "child_process";
import { IResponsePayload } from "../../model/IResponsePayload";
import { IRequestPayload } from "../../model/IRequestPayload";
import * as Process from "process";
import { ITransport, ITransportConstructor } from "../../model/ITransport";

export const processTransport = {
  getForParentProcess: (child: ChildProcess): ITransportConstructor => {
    return class TransportAdapter {
      constructor(
        inboundFn: (payload: IRequestPayload | IResponsePayload) => void
      ) {
        child.on("message", inboundFn);
      }

      outboundFn(payload: IResponsePayload | IRequestPayload): void {
        child.send(payload);
      }
    };
  },
  getForChildProcess: (process: typeof Process): ITransportConstructor => {
    return class TransportAdapter {
      constructor(
        inboundFn: (payload: IRequestPayload | IResponsePayload) => void
      ) {
        // @ts-ignore
        process.on("message", inboundFn);
      }

      outboundFn(payload: IResponsePayload | IRequestPayload) {
        // @ts-ignore
        process.send(payload);
      }
    };
  },
};
