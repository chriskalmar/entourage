import GraphQLJSON from 'graphql-type-json';
import { initProfile, destroyProfile } from './profile';
import { getProfileStats, getProfileConfig } from './stats';

export const typeDefs = `
scalar JSON

type ProfileState {
  timestamp: String!
  version: String!
  profile: String!
  params: JSON!
  docker: JSON!
  ready: Boolean!
  healthy: Boolean!
  ports: JSON
  stats: JSON
}

type Query {
  getProfileStats(
    version: String!
    profile: String!
  ): ProfileState!
}

type Mutation {
  initProfile(
    version: String!
    profile: String!
    params: JSON!
    asyncMode: Boolean
  ): ProfileState!

  destroyProfile(
    version: String!
    profile: String!
    params: JSON!
    asyncMode: Boolean
  ): ProfileState!
}

type Subscription {
  profileCreated(
    version: String!
    profile: String!
  ): ProfileState!

  profileDestroyed(
    version: String!
    profile: String!
  ): ProfileState!
}
`;

export const resolvers = {
  Query: {
    getProfileStats: (_, { profile, version }) =>
      getProfileConfig(profile, version),
  },
  ProfileState: {
    stats: ({ profile, version }) => getProfileStats(profile, version),
  },
  Mutation: {
    initProfile: (_, { profile, params, version, asyncMode }) =>
      initProfile(profile, params, version, asyncMode),
    destroyProfile: (_, { profile, params, version, asyncMode }) =>
      destroyProfile(profile, params, version, asyncMode),
  },
  Subscription: {
    profileCreated: {
      subscribe: (_, { profile, version }, { pubsub }) =>
        pubsub.asyncIterator(`profileCreated/${profile}/${version}`),
      resolve: payload => payload,
    },
    profileDestroyed: {
      subscribe: (_, { profile, version }, { pubsub }) =>
        pubsub.asyncIterator(`profileDestroyed/${profile}/${version}`),
      resolve: payload => payload,
    },
  },
  JSON: GraphQLJSON,
};
