const { makeExecutableSchema } = require("@graphql-tools/schema");
const { loadFilesSync } = require("@graphql-tools/load-files");
const express = require("express");
const path = require("path");
const cors = require("cors");
const { expressMiddleware } = require("@apollo/server/express4");
const { json } = require("body-parser");
const { ApolloServer } = require("@apollo/server");

async function startApolloServer() {
  const app = express();
  const loadedFiles = loadFilesSync("**/*", {
    extensions: ["graphql"],
  });
  const loadedResolvers = loadFilesSync(
    path.join(__dirname, "**/*.resolvers.js")
  );
  const schema = makeExecutableSchema({
    typeDefs: loadedFiles,
    resolvers: loadedResolvers,
  });
  const server = new ApolloServer({ schema });

  await server.start();
  app.use(
    "/graphql",
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  );
  const port = 4000;
  app.listen(port, () => {
    console.log(`Running a GraphQL API server`);
  });
}

startApolloServer();
