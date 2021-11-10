// import 'reflect-metadata';
// import handler from './app';
// import { startServer } from './app';
const { ApolloServer, gql } = require('apollo-server-lambda');
require('dotenv').config();

// async function main() {
//     const app = await startServer();
//     const port = process.env.port || 4000;
//     app.listen(port, () => {
//         console.log("Server listening on port: ", port);
//     });
// }

// const server = startServer();

// exports.handler = server;