const path = require("path");
const {fork} = require('child_process');
const {processTransport} = require("../../../dist/transports/nodejs/process");
const {proxycom} = require("../../../dist");

const apiConfig = {props: ["foo"]};

/**
 * Utility to help the test execution of multi-process scenario.
 * @type {{start: (function(*, *, *): Promise<unknown>)}}
 */
module.exports = {
    /**
     * Forks a child process (see file childProcess) and exposes an api.
     * Once forked, it sends a message to child process to call an api method with a specific argument.
     * Child process will then send a message with the returned value.
     *
     * @param fooSpy The method to be exposed on the service
     * @param callFooWith The value to be passed
     * @param resolvedSpy The function to call with the value received by child
     * @returns {Promise<*>} A promise that resolves once all parent-child interaction is done
     */
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

            proxycom.exposeApi({apiConfig, api: service, transport: processTransport.getForParentProcess(child)});

            child.send({action: "callFoo", value: callFooWith});
        })
    }
}