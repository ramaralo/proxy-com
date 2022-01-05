export interface IApiProxy {
    [key: string]: (...args: unknown[]) => void;
}
