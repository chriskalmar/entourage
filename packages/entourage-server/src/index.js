import { GraphQLServer } from 'graphql-yoga';
import GraphQLJSON from 'graphql-type-json';
import { initProfile } from './profile';
import { createWorkPathFolder, printTask } from './util';
import { createDockerNetwork } from './docker';
import { getProfileStats } from './stats';
import { initRegistry } from './registry';
import { log } from 'util';
import { restartProxy, updateProxyConfig } from './proxy';

const typeDefs = `
  scalar JSON

  type Query {
    getProfileStats(
      version: String!
      profile: String!
    ): JSON!
  }

  type Mutation {
    initProfile(
      version: String!
      profile: String!
      params: JSON!
      asyncMode: Boolean
    ): JSON!
  }
`;

const resolvers = {
  Query: {
    getProfileStats: (_, { profile, version }) =>
      getProfileStats(profile, version),
  },
  Mutation: {
    initProfile: (_, { profile, params, version, asyncMode }) =>
      initProfile(profile, params, version, asyncMode),
  },
  JSON: GraphQLJSON,
};

createDockerNetwork();
createWorkPathFolder();

printTask('Initializing registry');
initRegistry();

printTask('Updating proxy');
updateProxyConfig();

printTask('Restarting proxy');
restartProxy();

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => log(`Server is running on port ${process.env.PORT} ... 🚀`));
