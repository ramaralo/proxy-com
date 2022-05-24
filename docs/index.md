# proxy-com

Consume apis that run on different context.

Proxy-com facilitates the communication between different Javascript contexts. By context, we mean processes, browser
windows, web-workers, etc. It does this by implementing the Proxy pattern so that you can "consume" any API as if it was
the "real" API.

Weather you want to consume an API that runs on a different process, on a different browser window, on a Web-worker, etc.
Proxy-com can be adapted to work on any scenario. If fact, all these scenarios are the same, with the difference of the
method used to exchange data between processes, windows, etc. To allow for adaptation to each scenario, Proxy-com uses
specific **Transports** that know how to communicate between each context.

Proxy-com is used in two steps:

1. Expose an API
2. Create a proxy to the exposed API

# Quick start

## Install

From NodeJs:

`npm i proxy-com`

Or include on your HTML:

```html
<script src="https://unpkg.com/proxy-com@<version>/dist/proxycom-umd.js" />
```

Replacing `<version>` with the desired version. In this case, Proxy-com will be available at `window.ProxyCom`.

### Require or import

```javascript
const { proxycom } = require("proxy-com");

// or

import { proxycom } from "proxy-com";
```

Expose an api:

```javascript
const calculator = {
    add: (a, b) => {
        return a + b;
    }
}

proxycom.exposeApi({
    apiConfig: {
        name: "calculator", // The api name we are exposing. Keep in mind this needs to match the name passed to the proxy config!
        props: ["add"] // The api properties we want to expose. Tipically this will contain all api methods, but can be a subset if you want to
    },
    transport: <someTranport>>, // A transport for the context where the api is running.
    api: calculator // A reference to the api
});
```

And then create a proxy to that api:

```javascript
const proxy = proxycom.createProxy({
    apiConfig: {
        name: "calculator", // The api name we are create a proxy to. Keep in mind this needs to match the name passed to the exposed api
        props: ["add"] // The api properties we want to expose. Tipically this will contain all api methods, but can be a subset if you want to
    },
    transport: <someTransport>, // A transport for the context where the proxy is running.
});

// now we are ready to call the proxy
const result = await proxy.add(1, 2); // 3
```

## API

### proxycom.exposeApi(config)

#### config: [IExposeApiOptions](https://github.com/ramaralo/proxy-com/blob/main/src/model/IExposeApiOptions.ts)

A config object with the following properties:

| key       | type                                                                                             | mandatory | description                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apiConfig | [IApiConfig](https://github.com/ramaralo/proxy-com/blob/main/src/model/IApiConfig.ts)            | yes       | An object that repesents the API to be exposed. See [IApiConfig](https://github.com/ramaralo/proxy-com/blob/main/src/model/IApiConfig.ts) for more details |
| transport | [ITransportConstructor](https://github.com/ramaralo/proxy-com/blob/main/src/model/ITransport.ts) | yes       | A transport constructor                                                                                                                                    |
| api       | Object                                                                                           | yes       | A reference to the exposed API                                                                                                                             |

### proxycom.createProxy(config)

#### config: [ICreateProxyOptions](https://github.com/ramaralo/proxy-com/blob/main/src/model/ICreateProxyOptions.ts)

A config object with the following properties:

| key       | type                                                                                             | mandatory | description                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apiConfig | [IApiConfig](https://github.com/ramaralo/proxy-com/blob/main/src/model/IApiConfig.ts)            | yes       | An object that repesents the API to be exposed. See [IApiConfig](https://github.com/ramaralo/proxy-com/blob/main/src/model/IApiConfig.ts) for more details |
| transport | [ITransportConstructor](https://github.com/ramaralo/proxy-com/blob/main/src/model/ITransport.ts) | yes       | A transport constructor                                                                                                                                    |

_Most of the time, configs for both methods are the same so, when possible, it's recommended that the configs come from the same file._

# One lib, different contexts

**Proxy-com** itself is unaware of the context it is used in. So it doesn't know if it is being used between processes,
between browser windows or any other scenario. But _transports_ know.

As an example, let's look at a scenario of exposing an API between two NodeJs processes. Consider two sibling files:
`parentProcess.js` and `childProcess.js`:

```javascript
// parentProcess.js
const path = require("path");
const { fork } = require("./child_process");
const child = fork(path.resolve(__dirname, "childProcess.js"));

child.on("message", (message) => {
  console.log("parentProcess received:", message);
});

child.send("Message from parentProcess");
```

```javascript
// childProcess.js
process.on("message", (message) => {
  console.log("childProcess received:", message);
});

process.send("Message from childProcess");
```

If you run:
`node parentProcess.js`

You will get the following output:

```
parentProcess received: Message from childProcess
childProcess received: Message from parentProcess
```

Now, suppose `parentProcess` is running some api we want to consume on `childProcess`:

```javascript
// parentProcess.js
const path = require("path");
const { fork } = require("child_process");
const child = fork(path.resolve(__dirname, "childProcess.js"));

// we want childProcess to access this api:
const calculator = {
  add: (a, b) => {
    return a + b;
  },
};

child.on("message", (message) => {
  console.log("parentProcess received:", message);
});

child.send("Message from parentProcess");
```

By using `proxy-com` we don't need to handle the message passing between processes. Instead, we can do the following:

```javascript
// parentProcess.js

const path = require("path");
const { fork } = require("child_process");
const child = fork(path.resolve(__dirname, "childProcess.js"));

const { proxycom } = require("proxy-com"); // import Proxy-com
const { processTransport } = require("proxy-com/transports/nodejs/process"); // Use a transport for process communication provided by Proxy-com

const calculator = {
  add: (a, b) => {
    return a + b;
  },
};

proxycom.exposeApi({
  apiConfig: { name: "calculator", props: ["add"] },
  transport: processTransport.getForParentProcess(child), // using a parent process transport specific for multi NodeJs processes
  api: calculator,
});
```

and:

```javascript
// childProcess.js

const { proxycom } = require("proxy-com");
const { processTransport } = require("proxy-com/transports/nodejs/process");

const proxy = proxycom.createProxy({
  apiConfig: { name: "calculator", props: ["add"] },
  transport: processTransport.getForChildProcess(process), // using a child process transport specific for multi NodeJs processes
});

proxy.add(1, 2).then((result) => {
  console.log(result); // 3
});
```

As you can see, `proxy` is an object that also exposes an `add()` method that behaves as `calculator.add()` with one
exception:

**All methods exposed on `proxy` objects are Async.** regardless of the method being sync or async on the api side.

### What values can be returned from exposed APIs?

- Any value that can be serialized
- Promises that resolve or reject to any serializable value

So Proxy-com already provides Transport for inter-process communication scenarios. In the future it may provide additional
transports for other scenarios, but you can build your own transport.

If you need help building your own Transport let me know, and I'll be happy to help!

Meanwhile, if you want to get started checkout:

- https://github.com/ramaralo/proxy-com/blob/main/src/transports/nodejs/process.ts
- https://github.com/ramaralo/proxy-com/blob/main/src/model/ITransport.ts
