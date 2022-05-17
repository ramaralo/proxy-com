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

Generically, an API is exposed:

```javascript
const myApi = {
  foo: () => {
    // do some stuff
  },
};

proxycom.exposeApi(apiConfig, myService, transport); // apiConfig and transport are explained ahead
```

And then a proxy is created:

```javascript
const proxy = proxycom.createProxy(apiConfig, transport); // transport is explained ahead

proxy.foo();
```

# One lib, different contexts

**Proxy-com** itself is unaware of the context it is used in. It can be used between NodeJs processes, Browser windows,
etc. To achieve this, it uses specific Transports that do the actual work of sending messages between contexts.

Example:

Suppose you have the following code on Process A:

```javascript
// Process A
const myApi = {
  foo: () => {
    // do some stuff
  },
};
```

And on Process B you want to consume `MyApi`. So, first `myApi` will have to be exposed:

```javascript
// Process A
const myApi = {
  foo: () => {
    // do some stuff
  },
};
proxycom.exposeApi(apiConfig, myService, transport);
```

And then consumed via proxy:

```javascript
// Process B
const proxy = proxycom.createProxy(apiConfig, transport);

proxy.foo();
```
