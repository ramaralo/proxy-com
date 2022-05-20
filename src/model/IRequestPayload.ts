export interface IRequestPayload {
    name: string,
    uuid: string;
    propertyToCall: string,
    args: unknown[]
}
