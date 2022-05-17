const path = require("path");
const { fork } = require("child_process");

const { proxycom } = require("../../dist");
const apiConfig = require("./apiConfig");

const child = fork(path.resolve(__dirname, "./child-process"));

function getTransportForProxy(child) {
  return class TransportAdapter {
    constructor(inboundFn) {
      child.on("message", inboundFn);
    }

    outboundFn(payload) {
      child.send(payload);
    }
  };
}

/*
Access API on child
 */
const proxy = proxycom.createProxy(apiConfig, getTransportForProxy(child));
proxy.foo(123).then((data) => {
  proxy.resolved(data);
});
