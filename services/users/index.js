const {buildFederatedSchema} = require('@apollo/federation');
const {ApolloServer, gql} = require('apollo-server-express');
const express = require('express');
const User = require('./models/User');
const mongoStore = require('./db');

const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    username: String!
  }
  extend type Query {
    users: [User]
    user(id: ID!): User
  }
  extend type Mutation {
    createUser(userPayload: UserPayload): User
  }
  input UserPayload {
    username: String!
  }
`;

const resolvers = {
  Query: {
    users: async () => {
      const allUsers = await User.find({});
      return allUsers;
    },
    user: async (_, {id}) => {
      const currentUser = await User.findOne({_id: id});
      return currentUser;
    },
  },
  User: {
    __resolveReference: async (ref) => {
      const currentUser = await User.findOne({_id: ref.id});
      return currentUser;
    },
  },
  Mutation: {
    createUser: async (_, {userPayload: {username}}) => {
      const user = new User({username});
      const createdUser = await user.save();
      return createdUser;
    },
  },
};

mongoStore();

async function startApolloServer() {
  // Same ApolloServer initialization as before
  const server = new ApolloServer({
    schema: buildFederatedSchema([{typeDefs, resolvers}]),
  });
  // Required logic for integrating with Express
  await server.start();
  const app = express();
  server.applyMiddleware({
    app,

    // By default, apollo-server hosts its GraphQL endpoint at the
    // server root. However, *other* Apollo Server packages host it at
    // /graphql. Optionally provide this to match apollo-server.
    path: '/',
  });

  // Modified server startup
  await new Promise((resolve) => app.listen({port: 4001}, resolve));
  console.log(`User service ready at url: 4001`);
}
startApolloServer();
