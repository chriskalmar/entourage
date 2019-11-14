import { GraphQLServer } from 'graphql-yoga';
import GraphQLJSON from 'graphql-type-json';
import { runProfile } from './profile';

const typeDefs = `
  scalar JSON

  type Query {
    hello(name: String): String!
  }

  type Mutation {
    runProfile(
      name: String!
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
    runProfile: (_, { profile }) => runProfile(profile),
  },
  JSON: GraphQLJSON,
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() =>
  console.log(`Server is running on port ${process.env.PORT} ... 🚀`),
);
