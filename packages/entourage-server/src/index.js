import { Server as Broker } from 'aedes';
import { GraphQLServer } from 'graphql-yoga';
import { createServer } from 'net';
import { createDockerNetwork } from './docker';
import { resolvers, typeDefs } from './graphql';
import pubsub from './pubsub';
import { restartProxy, updateProxyConfig } from './proxy';
import { initRegistry } from './registry';
import { createWorkPathFolder, printTask, log } from './util';

createDockerNetwork();
createWorkPathFolder();

printTask('Initializing registry');
initRegistry();

printTask('Updating proxy');
updateProxyConfig();

printTask('Restarting proxy');
restartProxy();

// MQTT Broker
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

// HTTP Server
const serverOptions = {
  port: +process.env.PORT,
  endpoint: '/',
  subscriptions: {
    path: '/',
    onConnect: (params, socket, context) => {
      log(`WS onConnect ${JSON.stringify(params)}`);
      return context;
    },
    onDisconnect: (socket, context) => {
      log('WS onDisconnect');
      return context;
    },
  },
  playground: false,
};

const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } });
server.start(serverOptions, () =>
  log(`Server is running on port ${process.env.PORT} ... 🚀`),
);
