import EventEmitter from 'events';
import { MQTTPubSub } from 'graphql-mqtt-subscriptions';
import { connect } from 'mqtt';

export const eventBus = new EventEmitter();

export const subscribe = ({ config, eventName }) => {
  const client = connect(config.wsUrl, {
    reconnectPeriod: 1000,
    // clientId,
    // username,
    // password,
  });

  // client.on('connect', () => {
  //   console.log('MQTT - clientConnected');
  // });

  // client.on('offline', () => {
  //   console.log('MQTT - clientDisconnected');
  // });

  client.on('error', err => {
    console.log(`MQTT - client error : ${err && err.message}`);
  });

  const pubsub = new MQTTPubSub(client);

  // const subId = await
  pubsub.subscribe(eventName, (...args) => {
    eventBus.emit(eventName, ...args);
  });

  return client;
};
