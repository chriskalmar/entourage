FROM node:13.5.0-buster

LABEL maintainer="Chris Kalmar <christian.kalmar@gmail.com>"

ENV ENTOURAGE_DOCKER_MODE=1

RUN apt-get update \
  && apt-get upgrade -y \
  && curl -fsSL https://get.docker.com | bash \
  && curl -L https://github.com/docker/compose/releases/download/1.25.4/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose \
  && chmod +x /usr/local/bin/docker-compose

WORKDIR /app

COPY . /app/

RUN npm install \
  && npm run build

EXPOSE 5858
EXPOSE 1883

CMD npm run start
