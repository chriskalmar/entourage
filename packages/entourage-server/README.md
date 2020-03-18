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

## Setup

Run entourage server as a privileged docker container and provide a profiles folder and a work folder as volume mounts:

### Via docker

```sh
docker run -d --name entourage \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $PWD/profiles:/app/profiles \
  -v $PWD/work:/app/work \
  -p 5858:5858 \
  chriskalmar/entourage:latest
```

### Via docker-compose

create a file named `docker-compose.yml`:

```yaml
version: '3'

services:
  entourage:
    image: chriskalmar/entourage:latest
    environment:
      - PGDATA=/usr/local/pgsql/data
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./profiles:/app/profiles
      - ./work:/app/work
    ports:
      - '5858:5858'
```

and run it with:

```sh
docker-compose up -d
```
