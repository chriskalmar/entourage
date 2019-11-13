import { GraphQLServer } from 'graphql-yoga';
import GraphQLJSON from 'graphql-type-json';

const typeDefs = `
  scalar JSON

  type Query {
    hello(name: String): String!
  }

  type Mutation {
    start(
      name: String!
      template: String!
      params: JSON!
    ): JSON!
  }
`;

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'World'}`,
  },
  Mutation: {
    start: (_, all) => all,
  },
  JSON: GraphQLJSON,
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() =>
  console.log(`Server is running on port ${process.env.PORT} ... 🚀`),
);
