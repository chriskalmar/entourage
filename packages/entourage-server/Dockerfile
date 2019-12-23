FROM node:13.5.0-buster

LABEL maintainer="Chris Kalmar <christian.kalmar@gmail.com>"

WORKDIR /app

COPY . /app/

RUN ls -lah /app
RUN find /app

RUN yarn install \
  && yarn cache clean \
  && yarn build

EXPOSE 5858

CMD yarn run start
