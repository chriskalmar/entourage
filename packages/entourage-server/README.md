# entourage-server

> Server for environment bootstrapping

See repository page [chriskalmar/entourage](https://github.com/chriskalmar/entourage) for more information.

## Setup

Run entourage server as a privileged docker container and provide a profiles folder as volume mount:

```sh
docker run -d --name entourage \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $PWD/profiles:/app/profiles \
  -p 5858:5858 \
  chriskalmar/entourage:latest
```
