const path = require("path");
const {fork} = require('child_process');

const {proxycom} = require("../../dist");
const apiConfig = require("./apiConfig");

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


module.exports = {
    start: (fooSpy, callFooWith, resolvedSpy) => {
        const child = fork(path.resolve(__dirname,'./child-process'));

        return new Promise((resolve, reject)=> {
            child.on("message", (message) => {
                if(message.action === "returnValue") {
                    resolvedSpy(message.value);
                    child.disconnect();
                    child.unref();
                    child.kill();
                    resolve("done");
                }
            })

            const service = {
                foo: fooSpy
            }

            proxycom.exposeApi(apiConfig, service, getTransportForService(child));

            child.send({action: "callFoo", value: callFooWith});
        })
    }
}