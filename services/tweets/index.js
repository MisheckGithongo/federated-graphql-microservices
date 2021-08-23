const {buildFederatedSchema} = require('@apollo/federation');
const {ApolloServer, gql} = require('apollo-server-express');
const express = require('express');
const Tweet = require('./models/Tweet');
const mongoStore = require('./db');

const typeDefs = gql`
  type Tweet {
    text: String
    id: ID!
    creator: User
  }
  extend type User @key(fields: "id") {
    id: ID! @external
    tweets: [Tweet]
  }
  extend type Query {
    tweet(id: ID!): Tweet
    tweets: [Tweet]
  }
  extend type Mutation {
    createTweet(tweetPayload: TweetPayload): Tweet
  }
  input TweetPayload {
    userId: String
    text: String
  }
`;

const resolvers = {
  Query: {
    tweet: async (_, {id}) => {
      const currentTweet = await Tweet.findOne({_id: id});
      return currentTweet;
    },
    tweets: async () => {
      const tweetsList = await Tweet.find({});
      return tweetsList;
    },
  },
  Tweet: {
    creator: (tweet) => ({__typename: 'User', id: tweet.userId}),
  },
  User: {
    tweets: async (user) => {
      const tweetsByUser = await Tweet.find({userId: user.id});
      return tweetsByUser;
    },
  },
  Mutation: {
    createTweet: async (_, {tweetPayload: {text, userId}}) => {
      const newTweet = new Tweet({text, userId});
      const createdTweet = await newTweet.save();
      return createdTweet;
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
  await new Promise((resolve) => app.listen({port: 4002}, resolve));
  console.log(`User service ready at url: 4002`);
}
startApolloServer();
