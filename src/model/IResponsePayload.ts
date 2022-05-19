export interface IResponsePayload {
    type: IResponsePayloadEnum,
    uuid: string;
    returnValue: unknown;
}

export enum IResponsePayloadEnum {
    RESOLVED = "resolved",
    REJECTED = "rejected",
    ERROR = "ERROR"
};