[![dist](https://github.com/ramaralo/proxy-com/actions/workflows/dist.yml/badge.svg)](https://github.com/ramaralo/proxy-com/actions/workflows/dist.yml)
[![test](https://github.com/ramaralo/proxy-com/actions/workflows/test.yml/badge.svg)](https://github.com/ramaralo/proxy-com/actions/workflows/test.yml)
[![GitHub license](https://img.shields.io/github/license/ramaralo/proxy-com)](https://github.com/ramaralo/proxy-com/blob/main/LICENSE)

# THIS IS A WIP

# proxy-com

Consume apis that run on different context.

Suppose you have an api running on **Process A** and you want to use it on **Process B**. Usually you will use some IPC
mechanism forcing you to pass messages between processes. As the project grows, message passing becomes verbose with a
lot of repeated code.

**Proxy-com** aims to help by implementing a Proxy pattern to the API you want to consume.

## Install

From NodeJs:

`npm i proxy-com`

Or include on your HTML:

```html
<script src="https://unpkg.com/proxy-com@<version>/dist/web.bundle.js" />
```

Replacing `<version>` with the desired version.

## Require or import

```javascript
const { proxycom } = require("proxy-com");

// or

import { proxycom } from "proxy-com";
```

Expose an api:

```javascript
const myApi = {
    foo: () => {
        // do some stuff
    }
}

proxycom.exposeApi({
    apiConfig: <someConfig>, // we will explain this ahead
    transport: <someTransport>, // we will explain this ahead
    api: myApi
});
```

And then create a proxy to that api:

```javascript
const proxy = proxycom.createProxy({
    apiConfig: <someConfig>, // we will explain this ahead
    transport: <someTransport>, // we will explain this ahead
});

proxy.foo();
```

# One lib, different contexts

**Proxy-com** itself is unaware of the context it is used in. It can be used between NodeJs processes, Browser windows,
Web Workers, Chrome extensions, Electron processes, etc. To achieve this, it uses specific Transports that do the actual
work of sending messages between contexts.

One common scenario is when we want to consume apis that run on a different NodeJs process. This is one possible (simplified)
way to create a new process in NodeJs. Consider two sibling files: `parentProcess.js` and `childProcess.js`:

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
const myApi = {
  foo: (arg) => {
    console.log("Foo called with", arg);
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

const { proxycom } = require("proxy-com");
const { processTransport } = require("proxy-com/transports/nodejs/process");

const myApi = {
  foo: (arg) => {
    console.log("Foo called with", arg);
    return `Hi ${arg}, nice to meet you!`;
  },
};

proxycom.exposeApi({
  apiConfig: { name: "myApi", props: ["foo"] }, // declaring what methods of myApi we want to expose
  transport: processTransport.getForParentProcess(child), // using a parent process transport specific for multi NodeJs processes
  api: myApi, // exposing the api
});
```

and:

```javascript
// childProcess.js

const { proxycom } = require("proxy-com");
const { processTransport } = require("proxy-com/transports/nodejs/process");

const proxy = proxycom.createProxy({
  apiConfig: { name: "myApi", props: ["foo"] }, // declaring what method we want to proxy (usually the same that are exposed)
  transport: processTransport.getForChildProcess(process), // using a child process transport specific for multi NodeJs processes
});

proxy.foo("childProcess").then((response) => {
  console.log(response); // "Hi childProcess, nice to meet you!"
});
```
