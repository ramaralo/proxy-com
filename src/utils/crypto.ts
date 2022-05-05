const {randomUUID: randomUUIDRef} = globalThis.crypto || require("crypto");
export const randomUUID = () => randomUUIDRef;