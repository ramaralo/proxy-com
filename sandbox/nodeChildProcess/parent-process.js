const path = require("path");
const {fork} = require('child_process');

const {proxycom} = require("../../dist");
const apiConfig = require("./apiConfig");

const child = fork(path.resolve(__dirname,'./child-process'));
child.on("message", (message) => {
    console.log("received message from child", message);
})

/*
Expose API to child
 */
function getTransportForService(child) {
    return class TransportAdapter {
        constructor(inboundFn) {
            child.on("message", inboundFn);
        }

        outboundFn(payload) {
            child.send(payload);
        }
    }
}

const service = {
    foo: (data) => {
        console.log("foo called", data)
        return 1;
    },
    resolved: (resolvedData) => (
        console.log("resolved called with", resolvedData)
    )
}

proxycom.exposeApi(apiConfig, service, getTransportForService(child));