import { GraphQLServer } from 'graphql-yoga';
import { resolvers, typeDefs } from './graphql';
import pubsub from './pubsub';
import { log } from './util';

/**
 * @module Server
 */

/**
 * Start GraphQL HTTP/WS server
 *
 * @method module:Server~initServer
 * @returns {objet} server
 */
export const initServer = () => {
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

  const server = new GraphQLServer({
    typeDefs,
    resolvers,
    context: { pubsub },
  });
  server.start(serverOptions, () =>
    log(`Server is running on port ${process.env.PORT} ... 🚀`),
  );

  return server;
};
