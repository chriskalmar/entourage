import ApolloClient, { createNetworkInterface } from 'apollo-client';
import EventEmitter from 'events';
import {
  SubscriptionClient,
  addGraphQLSubscriptions,
} from 'subscriptions-transport-ws';

export const eventBus = new EventEmitter();

export const subscribe = ({ config, eventName, query, variables }) => {
  // const client = new SubscriptionClient(config.wsUrl, {
  //   reconnect: true,
  // });

  // const apolloClient = new ApolloClient({
  //   networkInterface: client,
  // });

  const networkInterface = createNetworkInterface({
    uri: config.url,
  });

  const wsClient = new SubscriptionClient(config.wsUrl, {
    reconnect: false,
    connectionParams: {
      // Pass any arguments you want for initialization
    },
  });

  const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
    networkInterface,
    wsClient,
  );

  const apolloClient = new ApolloClient({
    networkInterface: networkInterfaceWithSubscriptions,
  });

  apolloClient
    .subscribe({
      query,
      variables,
    })
    .subscribe({
      next(data) {
        eventBus.emit(eventName, data);
      },
    });

  return wsClient;
};
