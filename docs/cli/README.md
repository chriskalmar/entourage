
<a name="1md"></a>

# entourage-cli

> Client for entourage

See repository page [chriskalmar/entourage](https://github.com/chriskalmar/entourage) for more information.

## Install

Using npm:

```sh
npm install entourage-cli
```

or using yarn:

```sh
yarn add entourage-cli
```

## Example use with a CI pipeline

```bash

# initialize profile with the name 'demo'
# using the project's '.entourage.js' file as config
entourage-cli init demo

# using custom '.entourage.js' file as config
entourage-cli init demo --file test/.entourage.js

# meanwhile perform regular CI tasks
# like linting, building and so on

# check if profile is ready for up to 180 seconds before failing
entourage-cli wait demo 180

# collect generated ports and export them as environment variables
# e.g.
# PORT_httpbin_80=37820
# PORT_hello_80=47762
$(entourage-cli env demo)

# use new environment variable to configure your project
# and run integration tests

# clean up entourage server to free up resources
entourage-cli destroy demo

# continue with further CI tasks

```


<a name="2md"></a>

## Modules

<dl>
<dt><a href="#module_Command">Command</a></dt>
<dd></dd>
<dt><a href="#module_Request">Request</a></dt>
<dd></dd>
<dt><a href="#module_Subscribe">Subscribe</a></dt>
<dd></dd>
</dl>

<a name="module_Command"></a>

## Command

* [Command](#module_Command)
    * [~readConfig(configPath)](#module_Command..readConfig) ⇒ <code>objet</code>
    * [~checkConfig(config)](#module_Command..checkConfig) ⇒ <code>boolean</code>
    * [~init(argv)](#module_Command..init)
    * [~wait(argv)](#module_Command..wait)
    * [~destroy(argv)](#module_Command..destroy)
    * [~env(argv)](#module_Command..env)

<a name="module_Command..readConfig"></a>

### Command~readConfig(configPath) ⇒ <code>objet</code>
Read config file (JS | JSON)

**Kind**: inner method of [<code>Command</code>](#module_Command)  
**Returns**: <code>objet</code> - config  
**Throws**:

- Config file X not found


| Param | Type |
| --- | --- |
| configPath | <code>string</code> | 

<a name="module_Command..checkConfig"></a>

### Command~checkConfig(config) ⇒ <code>boolean</code>
Check config content

Validate url, profile and timeout presence

**Kind**: inner method of [<code>Command</code>](#module_Command)  
**Throws**:

- Invalid config


| Param | Type |
| --- | --- |
| config | <code>object</code> | 

<a name="module_Command..init"></a>

### Command~init(argv)
Init command

Trigger initProfile mutation on entourage-server

**Kind**: inner method of [<code>Command</code>](#module_Command)  

| Param | Type |
| --- | --- |
| argv | <code>object</code> | 

<a name="module_Command..wait"></a>

### Command~wait(argv)
Wait command

Trigger profileCreated subscription on entourage-server

**Kind**: inner method of [<code>Command</code>](#module_Command)  

| Param | Type |
| --- | --- |
| argv | <code>object</code> | 

<a name="module_Command..destroy"></a>

### Command~destroy(argv)
Destroy command

Trigger destroyProfile mutation on entourage-server

**Kind**: inner method of [<code>Command</code>](#module_Command)  

| Param | Type |
| --- | --- |
| argv | <code>object</code> | 

<a name="module_Command..env"></a>

### Command~env(argv)
Env command

Trigger getProfileStats query on entourage-server

**Kind**: inner method of [<code>Command</code>](#module_Command)  

| Param | Type |
| --- | --- |
| argv | <code>object</code> | 

<a name="module_Request"></a>

## Request
<a name="module_Request..request"></a>

### Request~request(req) ⇒ <code>object</code>
Create a request

**Kind**: inner method of [<code>Request</code>](#module_Request)  
**Returns**: <code>object</code> - response  

| Param | Type |
| --- | --- |
| req | <code>object</code> | 

**Properties**

| Name | Type |
| --- | --- |
| req.config | <code>object</code> | 
| req.query | <code>string</code> | 
| req.variables | <code>object</code> | 

<a name="module_Subscribe"></a>

## Subscribe

* [Subscribe](#module_Subscribe)
    * [~eventBus](#module_Subscribe..eventBus) : <code>EventEmitter</code>
    * [~subscribe(sub)](#module_Subscribe..subscribe) ⇒ <code>MQTTClient</code>
    * [~EventEmitter](#module_Subscribe..EventEmitter)
    * [~MQTTClient](#module_Subscribe..MQTTClient)

<a name="module_Subscribe..eventBus"></a>

### Subscribe~eventBus : <code>EventEmitter</code>
**Kind**: inner constant of [<code>Subscribe</code>](#module_Subscribe)  
<a name="module_Subscribe..subscribe"></a>

### Subscribe~subscribe(sub) ⇒ <code>MQTTClient</code>
Create a subscription

Send an event back onMessage

**Kind**: inner method of [<code>Subscribe</code>](#module_Subscribe)  
**Emits**: <code>event:eventName</code>  

| Param | Type |
| --- | --- |
| sub | <code>object</code> | 

**Properties**

| Name | Type |
| --- | --- |
| sub.config | <code>object</code> | 
| sub.eventName | <code>string</code> | 

<a name="module_Subscribe..EventEmitter"></a>

### Subscribe~EventEmitter
**Kind**: inner typedef of [<code>Subscribe</code>](#module_Subscribe)  
<a name="module_Subscribe..MQTTClient"></a>

### Subscribe~MQTTClient
**Kind**: inner typedef of [<code>Subscribe</code>](#module_Subscribe)  


<a name="readmemd"></a>

