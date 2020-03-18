
<a name="1md"></a>

# entourage-server

> Server for environment bootstrapping

See repository page [chriskalmar/entourage](https://github.com/chriskalmar/entourage) for more information.

## Profiles

Create a `profiles` folder that will be shared with docker container.

### Profile template

At the root of `profiles`, create a yml | yaml template like [demo-profile.yaml](./test/demo-profile.yaml).
You can use `defaults`->`params` to declare default params that will be used to fill out template files declared in `renderTemplates`.

Still at the root, create a folder that will contain your templates (`sourcePath`) and another one called `demo-profile` that will contain the files rendered (`targetPath`).

These templates will be parsed and variables will be replaced by your default params and those that will be passed to entourage-server API.

```
.
+-- demo-profile
|   +-- init-db.sh *
|   +-- stop-db.sh *
|   +-- docker-compose.yaml *
|   +-- env *
+-- templates
|   +-- demo-profile.init-db.sh
|   +-- demo-profile.stop-db.sh
|   +-- demo-profile.docker-compose.yaml
|   +-- demo-profile.env
+-- demo-profile.yaml

* created after rendering
```

#### Profile hooks

- `prepare`
- `beforeDestroy`

These hooks allows you to declare a `script` that will be executed before the environment will be started / destroyed.
Optionally fill the `timeout` field that will allow the entourage-server to kill the process after duration has passed.

#### Docker

`docker` field allows to declare the path of your `composeFile`.

## GraphQL API

### createProfile

```graphql
mutation createProfile($version: String!, $profile: String!, $params: JSON!) {
  initProfile(version: $version, profile: $profile, params: $params) {
    profile
    version
    ready
    ports
  }
}
```

```js
{
  "version" : "1",
  "profile": "demo-profile",
  "params": {
    "NODE_ENV": "development",
    "HOST": "mqtt-api",
    "MQTT_PORT": "1883",
    "WS_PORT": "3000"
  }
}
```

### profileCreated

```graphql
subscription watchProfileCreated($version: String!, $profile: String!) {
  profileCreated(version: $version, profile: $profile) {
    profile
    version
    ports
    ready
  }
}
```

```js
{
  "version" : "1",
  "profile": "demo-profile"
}
```

### getProfileStats

```graphql
query getProfileStats($version: String!, $profile: String!) {
  getProfileStats(version: $version, profile: $profile) {
    version
    ready
    profile
    ports
  }
}
```

```js
{
  "version" : "1",
  "profile": "demo-profile"
}
```

### destroyProfile

```graphql
mutation destroyProfile($version: String!, $profile: String!, $params: JSON!) {
  destroyProfile(version: $version, profile: $profile, params: $params) {
    profile
    version
    ready
    ports
  }
}
```

```js
{
  "version" : "1",
  "profile": "demo-profile",
  "params": {
    "NODE_ENV": "development",
    "HOST": "mqtt-api",
    "MQTT_PORT": "1883",
    "WS_PORT": "3000"
  }
}
```

### profileDestroyed

```graphql
subscription watchProfileDestroyed($version: String!, $profile: String!) {
  profileDestroyed(version: $version, profile: $profile) {
    profile
    version
    ports
    ready
  }
}
```

```js
{
  "version" : "1",
  "profile": "demo-profile"
}
```

## Setup

Run entourage server as a privileged docker container and provide a profiles folder and a work folder as volume mounts:

### Via docker

```sh
docker run -d --name entourage \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $PWD/profiles:/app/profiles \
  -v $PWD/work:/app/work \
  -p 5858:5858 \
  -p 4242:4242 \
  chriskalmar/entourage:latest
```

### Via docker-compose

create a file named `docker-compose.yml`:

```yaml
version: '3'

services:
  entourage:
    image: chriskalmar/entourage:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./profiles:/app/profiles
      - ./work:/app/work
    ports:
      - '5858:5858'
      - '4242:4242'
```

and run it with:

```sh
docker-compose up -d
```


<a name="2md"></a>

## Modules

<dl>
<dt><a href="#module_Broker">Broker</a></dt>
<dd></dd>
<dt><a href="#module_Docker">Docker</a></dt>
<dd></dd>
<dt><a href="#module_GraphQL">GraphQL</a></dt>
<dd></dd>
<dt><a href="#module_Template">Template</a></dt>
<dd></dd>
<dt><a href="#module_Proxy">Proxy</a></dt>
<dd></dd>
<dt><a href="#module_Registry">Registry</a></dt>
<dd></dd>
<dt><a href="#module_Render">Render</a></dt>
<dd></dd>
<dt><a href="#module_Script">Script</a></dt>
<dd></dd>
<dt><a href="#module_Server">Server</a></dt>
<dd></dd>
<dt><a href="#module_Stats">Stats</a></dt>
<dd></dd>
<dt><a href="#module_Template">Template</a></dt>
<dd></dd>
<dt><a href="#module_Utils">Utils</a></dt>
<dd></dd>
<dt><a href="#module_Yaml">Yaml</a></dt>
<dd></dd>
</dl>

<a name="module_Broker"></a>

## Broker

* [Broker](#module_Broker)
    * [~initBroker()](#module_Broker..initBroker) ⇒ <code>Aedes</code>
    * [~Aedes](#module_Broker..Aedes)

<a name="module_Broker..initBroker"></a>

### Broker~initBroker() ⇒ <code>Aedes</code>
Start MQTT broker

**Kind**: inner method of [<code>Broker</code>](#module_Broker)  
<a name="module_Broker..Aedes"></a>

### Broker~Aedes
**Kind**: inner typedef of [<code>Broker</code>](#module_Broker)  
<a name="module_Docker"></a>

## Docker

* [Docker](#module_Docker)
    * [~checkDockerComposeFileExists(filePath)](#module_Docker..checkDockerComposeFileExists)
    * [~validateDockerComposeFile(cwd, filePath)](#module_Docker..validateDockerComposeFile)
    * [~adjustDockerComposeFile(workVersionFolder, filePath)](#module_Docker..adjustDockerComposeFile) ⇒ <code>object</code>
    * [~updateDockerComposeFilesWithPorts(version, config, portRegistry)](#module_Docker..updateDockerComposeFilesWithPorts)
    * [~processDockerTask(version, config)](#module_Docker..processDockerTask) ⇒ <code>object</code>
    * [~processDockerTask(version, config)](#module_Docker..processDockerTask)
    * [~runDockerComposeFile(cwd, filePath)](#module_Docker..runDockerComposeFile)
    * [~runWorkVersionDockerComposeFile(version, config)](#module_Docker..runWorkVersionDockerComposeFile) ⇒ <code>Promise.&lt;function()&gt;</code>
    * [~downDockerComposeFile(cwd, filePath, clean)](#module_Docker..downDockerComposeFile)
    * [~downWorkVersionDockerComposeFile(version, config, clean)](#module_Docker..downWorkVersionDockerComposeFile) ⇒ <code>Promise.&lt;function()&gt;</code>
    * [~getDockerComposeStats(cwd, filePath)](#module_Docker..getDockerComposeStats) ⇒ <code>Promise.&lt;function()&gt;</code>
    * [~getWorkFolderMountSource()](#module_Docker..getWorkFolderMountSource) ⇒ <code>string</code>

<a name="module_Docker..checkDockerComposeFileExists"></a>

### Docker~checkDockerComposeFileExists(filePath)
Check docker-compose file presence

**Kind**: inner method of [<code>Docker</code>](#module_Docker)  
**Throws**:

- Docker compose file x not found


| Param | Type |
| --- | --- |
| filePath | <code>string</code> | 

<a name="module_Docker..validateDockerComposeFile"></a>

### Docker~validateDockerComposeFile(cwd, filePath)
Check docker-compose file validity

**Kind**: inner method of [<code>Docker</code>](#module_Docker)  
**Throws**:

- Docker compose error


| Param | Type |
| --- | --- |
| cwd | <code>string</code> | 
| filePath | <code>string</code> | 

<a name="module_Docker..adjustDockerComposeFile"></a>

### Docker~adjustDockerComposeFile(workVersionFolder, filePath) ⇒ <code>object</code>
Update docker-compose file network and ports mapping and generate portRegistry

**Kind**: inner method of [<code>Docker</code>](#module_Docker)  
**Returns**: <code>object</code> - portRegistry  
**Throws**:

- At least one service needs to expose a port


| Param | Type |
| --- | --- |
| workVersionFolder | <code>string</code> | 
| filePath | <code>string</code> | 

<a name="module_Docker..updateDockerComposeFilesWithPorts"></a>

### Docker~updateDockerComposeFilesWithPorts(version, config, portRegistry)
Update docker-compose file

**Kind**: inner method of [<code>Docker</code>](#module_Docker)  

| Param | Type |
| --- | --- |
| version | <code>string</code> | 
| config | <code>object</code> | 
| portRegistry | <code>object</code> | 

<a name="module_Docker..processDockerTask"></a>

### Docker~processDockerTask(version, config) ⇒ <code>object</code>
Validate compose-file

Convert generated port to random ports

Update docker-compose file

**Kind**: inner method of [<code>Docker</code>](#module_Docker)  
**Returns**: <code>object</code> - portRegistry  

| Param | Type |
| --- | --- |
| version | <code>string</code> | 
| config | <code>object</code> | 

<a name="module_Docker..processDockerTask"></a>

### Docker~processDockerTask(version, config)
Pull docker-compose file sources

**Kind**: inner method of [<code>Docker</code>](#module_Docker)  
**Throws**:

- Docker compose error


| Param | Type |
| --- | --- |
| version | <code>string</code> | 
| config | <code>object</code> | 

<a name="module_Docker..runDockerComposeFile"></a>

### Docker~runDockerComposeFile(cwd, filePath)
Start docker-compose file

**Kind**: inner method of [<code>Docker</code>](#module_Docker)  
**Throws**:

- Docker compose error


| Param | Type |
| --- | --- |
| cwd | <code>string</code> | 
| filePath | <code>string</code> | 

<a name="module_Docker..runWorkVersionDockerComposeFile"></a>

### Docker~runWorkVersionDockerComposeFile(version, config) ⇒ <code>Promise.&lt;function()&gt;</code>
Start docker-compose file from a work subfolder

**Kind**: inner method of [<code>Docker</code>](#module_Docker)  
**Returns**: <code>Promise.&lt;function()&gt;</code> - Docker~runDockerComposeFile  

| Param | Type |
| --- | --- |
| version | <code>string</code> | 
| config | <code>object</code> | 

<a name="module_Docker..downDockerComposeFile"></a>

### Docker~downDockerComposeFile(cwd, filePath, clean)
Stop docker-compose file

Optionally clean volumes, images and orphans

**Kind**: inner method of [<code>Docker</code>](#module_Docker)  
**Throws**:

- Docker compose error


| Param | Type |
| --- | --- |
| cwd | <code>string</code> | 
| filePath | <code>string</code> | 
| clean | <code>boolean</code> | 

<a name="module_Docker..downWorkVersionDockerComposeFile"></a>

### Docker~downWorkVersionDockerComposeFile(version, config, clean) ⇒ <code>Promise.&lt;function()&gt;</code>
Start docker-compose file from a work subfolder

Optionally clean volumes, images and orphans

**Kind**: inner method of [<code>Docker</code>](#module_Docker)  
**Returns**: <code>Promise.&lt;function()&gt;</code> - Docker~downDockerComposeFile  

| Param | Type |
| --- | --- |
| version | <code>string</code> | 
| config | <code>object</code> | 
| clean | <code>boolean</code> | 

<a name="module_Docker..getDockerComposeStats"></a>

### Docker~getDockerComposeStats(cwd, filePath) ⇒ <code>Promise.&lt;function()&gt;</code>
Get docker-compose stats

**Kind**: inner method of [<code>Docker</code>](#module_Docker)  
**Returns**: <code>Promise.&lt;function()&gt;</code> - compose.ps  
**Throws**:

- Docker compose error


| Param | Type |
| --- | --- |
| cwd | <code>string</code> | 
| filePath | <code>string</code> | 

<a name="module_Docker..getWorkFolderMountSource"></a>

### Docker~getWorkFolderMountSource() ⇒ <code>string</code>
Get docker-compose mountpoint

**Kind**: inner method of [<code>Docker</code>](#module_Docker)  
**Throws**:

- Cannot detect work folder mount point. Are you running Entourage server via docker?

<a name="module_GraphQL"></a>

## GraphQL

* [GraphQL](#module_GraphQL)
    * [~ProfileState](#module_GraphQL..ProfileState) : <code>GraphQLType</code>
    * [~Query](#module_GraphQL..Query) : <code>GraphQLType</code>
    * [~getProfileStats](#module_GraphQL..getProfileStats) ⇒ <code>GraphQLType</code>
    * [~Mutation](#module_GraphQL..Mutation) : <code>GraphQLType</code>
    * [~initProfile](#module_GraphQL..initProfile) ⇒ <code>GraphQLType</code>
    * [~destroyProfile](#module_GraphQL..destroyProfile) ⇒ <code>GraphQLType</code>
    * [~Subscriptions](#module_GraphQL..Subscriptions) : <code>GraphQLType</code>
    * [~profileCreated](#module_GraphQL..profileCreated) ⇒ <code>GraphQLType</code>
    * [~profileDestroyed](#module_GraphQL..profileDestroyed) ⇒ <code>GraphQLType</code>

<a name="module_GraphQL..ProfileState"></a>

### GraphQL~ProfileState : <code>GraphQLType</code>
**Kind**: inner constant of [<code>GraphQL</code>](#module_GraphQL)  
**Properties**

| Name | Type |
| --- | --- |
| timestamp | <code>string</code> | 
| version | <code>string</code> | 
| profile | <code>string</code> | 
| params | <code>object</code> | 
| docker | <code>object</code> | 
| ready | <code>boolean</code> | 
| healthy | <code>boolean</code> | 
| ports | <code>object</code> | 
| stats | <code>object</code> | 

<a name="module_GraphQL..Query"></a>

### GraphQL~Query : <code>GraphQLType</code>
**Kind**: inner constant of [<code>GraphQL</code>](#module_GraphQL)  
**Properties**

| Name | Type |
| --- | --- |
| getProfileStats | <code>GraphQLQuery</code> | 

<a name="module_GraphQL..getProfileStats"></a>

### GraphQL~getProfileStats ⇒ <code>GraphQLType</code>
**Kind**: inner constant of [<code>GraphQL</code>](#module_GraphQL)  
**Returns**: <code>GraphQLType</code> - ProfileState  
**Properties**

| Name | Type |
| --- | --- |
| version | <code>string</code> | 
| profile | <code>string</code> | 

<a name="module_GraphQL..Mutation"></a>

### GraphQL~Mutation : <code>GraphQLType</code>
**Kind**: inner constant of [<code>GraphQL</code>](#module_GraphQL)  
**Properties**

| Name | Type |
| --- | --- |
| initProfile | <code>GraphQLMutation</code> | 
| destroyProfile | <code>GraphQLMutation</code> | 

<a name="module_GraphQL..initProfile"></a>

### GraphQL~initProfile ⇒ <code>GraphQLType</code>
**Kind**: inner constant of [<code>GraphQL</code>](#module_GraphQL)  
**Returns**: <code>GraphQLType</code> - ProfileState  
**Properties**

| Name | Type |
| --- | --- |
| version | <code>string</code> | 
| profile | <code>string</code> | 
| params | <code>object</code> | 
| [asyncMode] | <code>boolean</code> | 

<a name="module_GraphQL..destroyProfile"></a>

### GraphQL~destroyProfile ⇒ <code>GraphQLType</code>
**Kind**: inner constant of [<code>GraphQL</code>](#module_GraphQL)  
**Returns**: <code>GraphQLType</code> - ProfileState  
**Properties**

| Name | Type |
| --- | --- |
| version | <code>string</code> | 
| profile | <code>string</code> | 
| params | <code>object</code> | 
| [asyncMode] | <code>boolean</code> | 

<a name="module_GraphQL..Subscriptions"></a>

### GraphQL~Subscriptions : <code>GraphQLType</code>
**Kind**: inner constant of [<code>GraphQL</code>](#module_GraphQL)  
**Properties**

| Name | Type |
| --- | --- |
| profileCreated | <code>GraphQLSubscription</code> | 
| profileDestroyed | <code>GraphQLSubscription</code> | 

<a name="module_GraphQL..profileCreated"></a>

### GraphQL~profileCreated ⇒ <code>GraphQLType</code>
**Kind**: inner constant of [<code>GraphQL</code>](#module_GraphQL)  
**Returns**: <code>GraphQLType</code> - ProfileState  
**Properties**

| Name | Type |
| --- | --- |
| version | <code>string</code> | 
| profile | <code>string</code> | 

<a name="module_GraphQL..profileDestroyed"></a>

### GraphQL~profileDestroyed ⇒ <code>GraphQLType</code>
**Kind**: inner constant of [<code>GraphQL</code>](#module_GraphQL)  
**Returns**: <code>GraphQLType</code> - ProfileState  
**Properties**

| Name | Type |
| --- | --- |
| version | <code>string</code> | 
| profile | <code>string</code> | 

<a name="module_Template"></a>

## Template

* [Template](#module_Template)
    * [~renderTemplate(templateFilename, templateParams)](#module_Template..renderTemplate) ⇒ <code>function</code>
    * [~renderTemplateToFile(templateFilename, templateParams, version, outputFilename)](#module_Template..renderTemplateToFile)

<a name="module_Template..renderTemplate"></a>

### Template~renderTemplate(templateFilename, templateParams) ⇒ <code>function</code>
Load a templateFilename and renders it from templateParams

**Kind**: inner method of [<code>Template</code>](#module_Template)  
**Returns**: <code>function</code> - Render~renderFile  
**Throws**:

- Template x not found


| Param | Type |
| --- | --- |
| templateFilename | <code>string</code> | 
| templateParams | <code>object</code> | 

<a name="module_Template..renderTemplateToFile"></a>

### Template~renderTemplateToFile(templateFilename, templateParams, version, outputFilename)
Load a templateFilename and renders it from templateParams,

then save it as file in a work subfolder

**Kind**: inner method of [<code>Template</code>](#module_Template)  

| Param | Type |
| --- | --- |
| templateFilename | <code>string</code> | 
| templateParams | <code>object</code> | 
| version | <code>string</code> | 
| outputFilename | <code>string</code> | 

<a name="module_Proxy"></a>

## Proxy

* [Proxy](#module_Proxy)
    * [~updateProxyConfig()](#module_Proxy..updateProxyConfig)
    * [~restartProxy()](#module_Proxy..restartProxy)

<a name="module_Proxy..updateProxyConfig"></a>

### Proxy~updateProxyConfig()
Update HAproxy configuration from the registry

Populate haproxy.cfg and haproxy.docker-compose.yaml templates

Save them at the root of WORK_PATH

**Kind**: inner method of [<code>Proxy</code>](#module_Proxy)  
<a name="module_Proxy..restartProxy"></a>

### Proxy~restartProxy()
Restart HAproxy docker container

**Kind**: inner method of [<code>Proxy</code>](#module_Proxy)  
<a name="module_Registry"></a>

## Registry

* [Registry](#module_Registry)
    * [~addWorkVersionConfig(config)](#module_Registry..addWorkVersionConfig)
    * [~getWorkVersionConfig(config)](#module_Registry..getWorkVersionConfig) ⇒ <code>object</code>
    * [~removeWorkVersionConfig(config)](#module_Registry..removeWorkVersionConfig)
    * [~initRegistry()](#module_Registry..initRegistry)

<a name="module_Registry..addWorkVersionConfig"></a>

### Registry~addWorkVersionConfig(config)
Save a profile configuration in the registry

**Kind**: inner method of [<code>Registry</code>](#module_Registry)  

| Param | Type |
| --- | --- |
| config | <code>object</code> | 

<a name="module_Registry..getWorkVersionConfig"></a>

### Registry~getWorkVersionConfig(config) ⇒ <code>object</code>
Find a profile configuration in the registry

**Kind**: inner method of [<code>Registry</code>](#module_Registry)  

| Param | Type |
| --- | --- |
| config | <code>object</code> | 

<a name="module_Registry..removeWorkVersionConfig"></a>

### Registry~removeWorkVersionConfig(config)
Remove a profile configuration in the registry

**Kind**: inner method of [<code>Registry</code>](#module_Registry)  

| Param | Type |
| --- | --- |
| config | <code>object</code> | 

<a name="module_Registry..initRegistry"></a>

### Registry~initRegistry()
Initialize the registry from existing work subfolder

**Kind**: inner method of [<code>Registry</code>](#module_Registry)  
<a name="module_Render"></a>

## Render

* [Render](#module_Render)
    * [~render(content, templateParams, escapePatterns)](#module_Render..render) ⇒ <code>object</code>
    * [~renderFile(content, templateParams, escapePatterns)](#module_Render..renderFile) ⇒ <code>function</code>

<a name="module_Render..render"></a>

### Render~render(content, templateParams, escapePatterns) ⇒ <code>object</code>
Render a template file by replacing variables

**Kind**: inner method of [<code>Render</code>](#module_Render)  

| Param | Type |
| --- | --- |
| content | <code>string</code> | 
| templateParams | <code>object</code> | 
| escapePatterns | <code>array</code> | 

<a name="module_Render..renderFile"></a>

### Render~renderFile(content, templateParams, escapePatterns) ⇒ <code>function</code>
Find a template file and render it by replacing variables

**Kind**: inner method of [<code>Render</code>](#module_Render)  
**Returns**: <code>function</code> - Render~render  

| Param | Type |
| --- | --- |
| content | <code>string</code> | 
| templateParams | <code>object</code> | 
| escapePatterns | <code>array</code> | 

<a name="module_Script"></a>

## Script

* [Script](#module_Script)
    * [~executeScript(version, script, params, [timeout])](#module_Script..executeScript) ⇒ <code>Promise.&lt;number&gt;</code>
    * [~executeScript(version, scripts, params, [timeout])](#module_Script..executeScript)

<a name="module_Script..executeScript"></a>

### Script~executeScript(version, script, params, [timeout]) ⇒ <code>Promise.&lt;number&gt;</code>
Execute a bash script from a work subfolder

Optional timeout to kill the process

**Kind**: inner method of [<code>Script</code>](#module_Script)  
**Returns**: <code>Promise.&lt;number&gt;</code> - exitCode  
**Throws**:

- Script timed out: x.


| Param | Type |
| --- | --- |
| version | <code>string</code> | 
| script | <code>string</code> | 
| params | <code>string</code> | 
| [timeout] | <code>number</code> | 

<a name="module_Script..executeScript"></a>

### Script~executeScript(version, scripts, params, [timeout])
Execute a series of bash scripts from a work subfolder

Optional timeout to kill the process

**Kind**: inner method of [<code>Script</code>](#module_Script)  
**Throws**:

- Script execution failed with exit code x.


| Param | Type |
| --- | --- |
| version | <code>string</code> | 
| scripts | <code>object</code> | 
| params | <code>string</code> | 
| [timeout] | <code>number</code> | 

<a name="module_Server"></a>

## Server

* [Server](#module_Server)
    * [~initServer()](#module_Server..initServer) ⇒ <code>GraphQLServer</code>
    * [~GraphQLServer](#module_Server..GraphQLServer)

<a name="module_Server..initServer"></a>

### Server~initServer() ⇒ <code>GraphQLServer</code>
Start GraphQL HTTP/WS server

**Kind**: inner method of [<code>Server</code>](#module_Server)  
<a name="module_Server..GraphQLServer"></a>

### Server~GraphQLServer
**Kind**: inner typedef of [<code>Server</code>](#module_Server)  
<a name="module_Stats"></a>

## Stats

* [Stats](#module_Stats)
    * [~getProfileConfig(profile, version)](#module_Stats..getProfileConfig) ⇒ <code>Promise.&lt;object&gt;</code>
    * [~getProfileStats(profile, version)](#module_Stats..getProfileStats) ⇒ <code>Promise.&lt;object&gt;</code>

<a name="module_Stats..getProfileConfig"></a>

### Stats~getProfileConfig(profile, version) ⇒ <code>Promise.&lt;object&gt;</code>
Retrieve a profile config from the registry

**Kind**: inner method of [<code>Stats</code>](#module_Stats)  
**Throws**:

- Unknown profile


| Param | Type |
| --- | --- |
| profile | <code>string</code> | 
| version | <code>string</code> | 

<a name="module_Stats..getProfileStats"></a>

### Stats~getProfileStats(profile, version) ⇒ <code>Promise.&lt;object&gt;</code>
Retrieve profile stats from docker compose

**Kind**: inner method of [<code>Stats</code>](#module_Stats)  
**Throws**:

- Unknown profile


| Param | Type |
| --- | --- |
| profile | <code>string</code> | 
| version | <code>string</code> | 

<a name="module_Template"></a>

## Template

* [Template](#module_Template)
    * [~renderTemplate(templateFilename, templateParams)](#module_Template..renderTemplate) ⇒ <code>function</code>
    * [~renderTemplateToFile(templateFilename, templateParams, version, outputFilename)](#module_Template..renderTemplateToFile)

<a name="module_Template..renderTemplate"></a>

### Template~renderTemplate(templateFilename, templateParams) ⇒ <code>function</code>
Load a templateFilename and renders it from templateParams

**Kind**: inner method of [<code>Template</code>](#module_Template)  
**Returns**: <code>function</code> - Render~renderFile  
**Throws**:

- Template x not found


| Param | Type |
| --- | --- |
| templateFilename | <code>string</code> | 
| templateParams | <code>object</code> | 

<a name="module_Template..renderTemplateToFile"></a>

### Template~renderTemplateToFile(templateFilename, templateParams, version, outputFilename)
Load a templateFilename and renders it from templateParams,

then save it as file in a work subfolder

**Kind**: inner method of [<code>Template</code>](#module_Template)  

| Param | Type |
| --- | --- |
| templateFilename | <code>string</code> | 
| templateParams | <code>object</code> | 
| version | <code>string</code> | 
| outputFilename | <code>string</code> | 

<a name="module_Utils"></a>

## Utils

* [Utils](#module_Utils)
    * [~log(msg)](#module_Utils..log) ⇒ <code>function</code>
    * [~createWorkPathFolder(version)](#module_Utils..createWorkPathFolder)
    * [~getWorkVersionFolder(version)](#module_Utils..getWorkVersionFolder) ⇒ <code>function</code>
    * [~checkVersionPathBreakout(version)](#module_Utils..checkVersionPathBreakout)
    * [~writeFileSync(filename, content)](#module_Utils..writeFileSync) ⇒ <code>function</code>
    * [~deleteWorkVersionFolder(version)](#module_Utils..deleteWorkVersionFolder)
    * [~createOrResetWorkVersionFolder(version)](#module_Utils..createOrResetWorkVersionFolder)
    * [~createOrResetWorkVersionFolder(task)](#module_Utils..createOrResetWorkVersionFolder) ⇒ <code>function</code>
    * [~getRandomPort(minPort, maxPort)](#module_Utils..getRandomPort) ⇒ <code>Promise.&lt;function()&gt;</code>
    * [~getRandomPorts(count, minPort, maxPort, exclude)](#module_Utils..getRandomPorts) ⇒ <code>Promise.&lt;array&gt;</code>
    * [~storeWorkVersionConfig(version, config)](#module_Utils..storeWorkVersionConfig) ⇒ <code>Promise.&lt;function()&gt;</code>

<a name="module_Utils..log"></a>

### Utils~log(msg) ⇒ <code>function</code>
Log a message

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Returns**: <code>function</code> - console.log  

| Param | Type |
| --- | --- |
| msg | <code>any</code> | 

<a name="module_Utils..createWorkPathFolder"></a>

### Utils~createWorkPathFolder(version)
Create a work folder from WORK_PATH environement variable

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  

| Param | Type |
| --- | --- |
| version | <code>string</code> | 

<a name="module_Utils..getWorkVersionFolder"></a>

### Utils~getWorkVersionFolder(version) ⇒ <code>function</code>
Get a work sub folder name from the version and WORK_PATH environement variable

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Returns**: <code>function</code> - path.normalize  

| Param | Type |
| --- | --- |
| version | <code>string</code> | 

<a name="module_Utils..checkVersionPathBreakout"></a>

### Utils~checkVersionPathBreakout(version)
Check that a work sub folder name is disposed under WORK_PATH

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Throws**:

- Version x needs to be a child of WORK_PATH


| Param | Type |
| --- | --- |
| version | <code>string</code> | 

<a name="module_Utils..writeFileSync"></a>

### Utils~writeFileSync(filename, content) ⇒ <code>function</code>
Write a file

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Returns**: <code>function</code> - fs.writeFileSync  

| Param | Type |
| --- | --- |
| filename | <code>string</code> | 
| content | <code>any</code> | 

<a name="module_Utils..deleteWorkVersionFolder"></a>

### Utils~deleteWorkVersionFolder(version)
Delete a work sub folder by version

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  

| Param | Type |
| --- | --- |
| version | <code>string</code> | 

<a name="module_Utils..createOrResetWorkVersionFolder"></a>

### Utils~createOrResetWorkVersionFolder(version)
Create or reset a work sub folder by version

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Throws**:

- Version x is already in use


| Param | Type |
| --- | --- |
| version | <code>string</code> | 

<a name="module_Utils..createOrResetWorkVersionFolder"></a>

### Utils~createOrResetWorkVersionFolder(task) ⇒ <code>function</code>
Log a task

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Returns**: <code>function</code> - Utils~log  

| Param | Type |
| --- | --- |
| task | <code>string</code> | 

<a name="module_Utils..getRandomPort"></a>

### Utils~getRandomPort(minPort, maxPort) ⇒ <code>Promise.&lt;function()&gt;</code>
Generate a random port within a declared range

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Returns**: <code>Promise.&lt;function()&gt;</code> - portfinder.getPortPromise  

| Param | Type |
| --- | --- |
| minPort | <code>number</code> | 
| maxPort | <code>number</code> | 

<a name="module_Utils..getRandomPorts"></a>

### Utils~getRandomPorts(count, minPort, maxPort, exclude) ⇒ <code>Promise.&lt;array&gt;</code>
Generate an array of `count` random ports within a declared range

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Throws**:

- Too many tries to find an open port


| Param | Type |
| --- | --- |
| count | <code>number</code> | 
| minPort | <code>number</code> | 
| maxPort | <code>number</code> | 
| exclude | <code>Array.&lt;number&gt;</code> | 

<a name="module_Utils..storeWorkVersionConfig"></a>

### Utils~storeWorkVersionConfig(version, config) ⇒ <code>Promise.&lt;function()&gt;</code>
Write profile configuration into the work folder

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Returns**: <code>Promise.&lt;function()&gt;</code> - Utils~writeFileSync  

| Param | Type |
| --- | --- |
| version | <code>string</code> | 
| config | <code>object</code> | 

<a name="module_Yaml"></a>

## Yaml

* [Yaml](#module_Yaml)
    * [~parseYaml(content)](#module_Yaml..parseYaml) ⇒ <code>function</code>
    * [~parseYamlFile(filePath)](#module_Yaml..parseYamlFile) ⇒ <code>function</code>
    * [~serializeYaml(content)](#module_Yaml..serializeYaml) ⇒ <code>function</code>
    * [~serializeYamlFile(content, filePath)](#module_Yaml..serializeYamlFile) ⇒ <code>function</code>

<a name="module_Yaml..parseYaml"></a>

### Yaml~parseYaml(content) ⇒ <code>function</code>
Parse a yaml file content

**Kind**: inner method of [<code>Yaml</code>](#module_Yaml)  
**Returns**: <code>function</code> - yaml.safeLoad  

| Param | Type |
| --- | --- |
| content | <code>string</code> | 

<a name="module_Yaml..parseYamlFile"></a>

### Yaml~parseYamlFile(filePath) ⇒ <code>function</code>
Parse a yaml file

**Kind**: inner method of [<code>Yaml</code>](#module_Yaml)  
**Returns**: <code>function</code> - Yaml~parseYaml  

| Param | Type |
| --- | --- |
| filePath | <code>string</code> | 

<a name="module_Yaml..serializeYaml"></a>

### Yaml~serializeYaml(content) ⇒ <code>function</code>
Serialize some content to yaml format

**Kind**: inner method of [<code>Yaml</code>](#module_Yaml)  
**Returns**: <code>function</code> - yaml.safeDump  

| Param | Type |
| --- | --- |
| content | <code>any</code> | 

<a name="module_Yaml..serializeYamlFile"></a>

### Yaml~serializeYamlFile(content, filePath) ⇒ <code>function</code>
Serialize some content to yaml format and save it as a file

**Kind**: inner method of [<code>Yaml</code>](#module_Yaml)  
**Returns**: <code>function</code> - fs.writeFileSync  

| Param | Type |
| --- | --- |
| content | <code>any</code> | 
| filePath | <code>string</code> | 



<a name="readmemd"></a>

