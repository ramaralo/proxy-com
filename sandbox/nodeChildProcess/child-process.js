const {proxycom} = require("../../dist");
const apiConfig = require("./apiConfig");

/*
Access API on parent
 */
function getTransportForProxy(process) {
    return class TransportAdapter {
        constructor(inboundFn) {
            process.on("message", inboundFn);
        }

        outboundFn(payload) {
            process.send(payload);
        }
    }
}

const proxy = proxycom.createProxy(apiConfig, getTransportForProxy(process));
proxy.foo(123).then((data) => {
    proxy.resolved(data);
})




