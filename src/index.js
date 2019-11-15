import { GraphQLServer } from 'graphql-yoga';
import GraphQLJSON from 'graphql-type-json';
import { runProfile } from './profile';
import { createWorkPathFolder } from './util';

const typeDefs = `
  scalar JSON

  type Query {
    hello(name: String): String!
  }

  type Mutation {
    runProfile(
      version: String!
      profile: String!
      params: JSON!
    ): JSON!
  }
`;

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
  },
  Mutation: {
    runProfile: (_, { profile, params, version }) =>
      runProfile(profile, params, version),
  },
  JSON: GraphQLJSON,
};

createWorkPathFolder();

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() =>
  console.log(`Server is running on port ${process.env.PORT} ... 🚀`),
);
