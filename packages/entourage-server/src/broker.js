import { Server as Broker } from 'aedes';
import { createServer } from 'net';
import { log } from './util';

/**
 * @module Broker
 */

/**
 * Start MQTT broker
 *
 * @method module:Broker~initBroker
 * @returns {objet} broker
 */
export const initBroker = () => {
  const brokerConf = {
    concurrency: 100,
    // authenticate,
    // published,
    // authorizePublish,
    // authorizeSubscribe,
  };

  const broker = new Broker(brokerConf);

  const tcpServer = createServer(broker.handle).listen(
    +process.env.MQTT_PORT,
    () => {
      log(`Broker is running on port ${process.env.MQTT_PORT} ... 🚀`);
    },
  );

  broker.on('client', client => {
    log(`MQTT onConnect ${client ? client.id : null}`);
  });

  broker.on('clientDisconnect', client => {
    log(`MQTT onDisconnect ${client ? client.id : null}`);
  });

  broker.on('publish', (packet, client) => {
    if (packet.topic.startsWith('$SYS')) {
      return;
    }
    log(`MQTT onPublish ${client ? client.id : null}`);
  });

  broker.on('subscribe', (subscriptions, client) => {
    log(
      `MQTT onSubscribe ${
        Array.isArray(subscriptions)
          ? subscriptions.map(sub => sub.topic).join(', ')
          : subscriptions.topic
      } ${client ? client.id : null}`,
    );
  });

  broker.once('closed', () => {
    tcpServer.close();
    log('MQTT Broker has been stopped');
  });

  return broker;
};
