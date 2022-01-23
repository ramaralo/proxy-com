export interface IApiProxy {
    [key: string]: (...args: unknown[]) => Promise<void>;
}
