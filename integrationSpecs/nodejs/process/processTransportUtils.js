const path = require("path");
const {fork} = require('child_process');
const {processTransport} = require("../../../dist/transports/nodejs/process");
const {proxycom} = require("../../../dist");

const apiConfig = {props: ["foo"]};

module.exports = {
    start: (fooSpy, callFooWith, resolvedSpy) => {
        const child = fork(path.resolve(__dirname,'./child-process'));

        return new Promise((resolve)=> {
            child.on("message", (message) => {
                if(message.action === "returnValue") {
                    resolvedSpy(message.value);
                    child.disconnect();
                    resolve("done");
                }
            })

            const service = {
                foo: fooSpy
            }

            proxycom.exposeApi(apiConfig, service, processTransport.getForParentProcess(child));

            child.send({action: "callFoo", value: callFooWith});
        })
    }
}