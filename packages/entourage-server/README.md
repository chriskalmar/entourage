# entourage-server

> Server for environment bootstrapping

See repository page [chriskalmar/entourage](https://github.com/chriskalmar/entourage) for more information.

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
version: "3"

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
      - "5858:5858"

```

and run it with:
```sh
docker-compose up -d
```