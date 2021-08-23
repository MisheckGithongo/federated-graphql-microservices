const {ApolloServer} = require('apollo-server-express');
const {ApolloGateway} = require('@apollo/gateway');
const express = require( 'express');

const gateway = new ApolloGateway({
  serviceList: [
    {name: 'users', url: 'http://localhost:4001'},
    {name: 'tweets', url: 'http://localhost:4002'},
  ],
});

async function startApolloServer() {
  // Same ApolloServer initialization as before
  const server = new ApolloServer({gateway, subscriptions: false});

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
  await new Promise((resolve) => app.listen({port: 4000}, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}
startApolloServer();
