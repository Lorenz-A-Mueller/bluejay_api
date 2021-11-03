const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const express = require('express');
const { typeDefs } = require('./utils/typeDefs');
const { resolvers } = require('./utils/resolvers');

const app = express();

const corsOptions = {
  // origin: '*',
  origin: ['http://localhost:3000', 'http://localhost:19006'], // TODO: how to allow the sandbox access?
  credentials: true,
};
app.use(cors(corsOptions));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: ({ req, res }) => ({
    req,
    res,
  }),
});

const main = async () => {
  await server.start();

  server.applyMiddleware({ app, cors: false, path: '/graphql' });

  // app.get('/rest', (req, res) => {
  //   res.json({
  //     data: 'API is working...',
  //   });
  // });

  app.listen(process.env.PORT || 4000, () => {
    console.log(`🚀  Server ready at port ${process.env.PORT || 4000}`);
  });
};

main();
