import { ChildProcess } from "child_process";
import { IResponsePayload } from "../../model/IResponsePayload";
import { IRequestPayload } from "../../model/IRequestPayload";
import * as Process from "process";

export const processTransport = {
  getForParentProcess: (child: ChildProcess) => {
    return class TransportAdapter {
      constructor(inboundFn: () => void) {
        child.on("message", inboundFn);
      }

      outboundFn(payload: IResponsePayload | IRequestPayload) {
        child.send(payload);
      }
    };
  },
  getForChildProcess: (process: typeof Process) => {
    return class TransportAdapter {
      constructor(inboundFn: () => void) {
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
