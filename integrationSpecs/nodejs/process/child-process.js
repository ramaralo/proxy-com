const {proxycom} = require("../../../dist");
const apiConfig = {name: "myService", props: ["foo"]};

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

const proxy = proxycom.createProxy(
    {
        name: "myService",
        apiConfig,
        transport: getTransportForProxy(process)
    }
);

process.on("message", (message) => {
    if(message.action === "callFoo") {
        proxy.foo(message.value).then((data) => {
            process.send({action: "returnValue", value: data});
        })
    }
})





