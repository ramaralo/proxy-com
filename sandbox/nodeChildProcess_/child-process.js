const {proxycom} = require("../../dist");
const apiConfig = require("./apiConfig");

/*
Access API on parent
 */
function getTransportForApi(process) {
    return class TransportAdapter {
        constructor(inboundFn) {
            process.on("message", inboundFn);
        }

        outboundFn(payload) {
            process.send(payload);
        }
    }
}

const proxy = proxycom.createProxy(apiConfig, getTransportForApi(process));
proxy.foo(123).then((data) => {
    proxy.resolved(data);
})

/*
Expose API to parent
 */

const childApi = {
    foo: (data) => {
        console.log("childApi.foo called", data)
        return 1;
    },
    resolved: (resolvedData) => (
        console.log("child process resolved called with", resolvedData)
    )
}

proxycom.exposeApi(apiConfig, childApi, getTransportForApi(process))


