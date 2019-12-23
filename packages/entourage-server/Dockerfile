FROM node:13.5.0-buster

LABEL maintainer="Chris Kalmar <christian.kalmar@gmail.com>"

RUN apt-get update \
  && apt-get upgrade -y \
  && curl -fsSL https://get.docker.com | bash \
  && curl -L https://github.com/docker/compose/releases/download/1.18.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose \
  && chmod +x /usr/local/bin/docker-compose

WORKDIR /app

COPY . /app/

RUN ls -lah /app
RUN find /app

RUN yarn install \
  && yarn cache clean \
  && yarn build

EXPOSE 5858

CMD yarn run start
