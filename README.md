[![dist](https://github.com/ramaralo/proxy-com/actions/workflows/dist.yml/badge.svg)](https://github.com/ramaralo/proxy-com/actions/workflows/dist.yml)
[![test](https://github.com/ramaralo/proxy-com/actions/workflows/test.yml/badge.svg)](https://github.com/ramaralo/proxy-com/actions/workflows/test.yml)
[![GitHub license](https://img.shields.io/github/license/ramaralo/proxy-com)](https://github.com/ramaralo/proxy-com/blob/main/LICENSE)

# proxy-com
Consume apis that run on different context.

Suppose you have an api running on **Process A** and you want to use it on **Process B**. Usually you will use some IPC
mechanism forcing you to pass messages between processes. As the project grows, message passing becomes verbose with a
lot of repeated code.

**Proxy-com** aims to help by implementing a Proxy pattern to the API you want to consume.

# One lib, different contexts
**Proxy-com** itself is unaware of the context it is used. It can be used between NodeJs processes, Browser windows, etc.
To achieve this, it uses specific Transports that do the actual work of sending messages between contexts.


