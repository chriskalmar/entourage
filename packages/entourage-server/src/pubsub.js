import { MQTTPubSub } from 'graphql-mqtt-subscriptions';
import { connect } from 'mqtt';
import { log } from './util';

const client = connect(`mqtt://localhost:${process.env.MQTT_PORT}`, {
  reconnectPeriod: 1000,
  // clientId,
  // username,
  // password,
});

client.on('error', err => {
  log(`MQTT - client error : ${err && err.message}`);
});

client.on('connect', () => {
  log('MQTT - clientConnected');
});

client.on('offline', () => {
  log('MQTT - clientDisconnected');
});

export const pubsub = new MQTTPubSub({ client });
