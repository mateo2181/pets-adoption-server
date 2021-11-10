import 'reflect-metadata';
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-lambda';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { buildSchema, buildSchemaSync, registerEnumType } from 'type-graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import cors from 'cors';
import authRouter from './auth';
import { PetResolver, UserResolver } from './graphql/resolvers';
import { authChecker } from './graphql/authorization/authChecker';
import helper from './auth/helper';
import { prisma } from './prisma';
import { PetsStatusEnum } from './graphql/types';
import fileUpload from 'express-fileupload';
import { PetTypeResolver } from './graphql/resolvers/petTypeResolver';


registerEnumType(PetsStatusEnum, {
    name: "PetsStatusEnum", // this one is mandatory
});

(<any>global).cachedSchema = (<any>global).cachedSchema || buildSchemaSync({
        resolvers: [PetResolver, PetTypeResolver, UserResolver],
        authChecker
    });

const schema = (<any>global).cachedSchema;

async function getServer() {
    return new ApolloServer({
        schema
    });
}

export function handler(event: any, ctx: any, callback: any) {
    getServer()
        .then(server => server.createHandler())
        .then(handler => handler(event, ctx, callback))
}

// export function handler() {
//     // const app = express();
    
//     // app.use(express.json());
//     // app.use(cors());
//     // app.use(fileUpload());
//     // app.use('/auth', authRouter);

//     // app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
//     const server = new ApolloServer({
//         schema,
//         // uploads: false,
//         context: ({ event }) => {
//             const token = event.headers.authorization || '';
//             // const user = await helper.getUser(token);
//             return { headers: event.headers, prisma };
//         },
//         introspection: true,
//         plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
//     })

//     // await server.start();
//     // server.applyMiddleware({ app, path: '/graphql' });
//     return server.createHandler({
//         expressGetMiddlewareOptions: {
//             cors: {
//               origin: '*',
//               credentials: true,
//             }
//           },
//     });
// };

// exports.handler = handler; 

// Construct a schema, using GraphQL schema language
// const typeDefs = gql`
//   type Query {
//     hello: String
//   }
// `;

// // Provide resolver functions for your schema fields
// const resolvers = {
//   Query: {
//     hello: () => 'Hello world!',
//   },
// };

// const server = new ApolloServer({ 
//     typeDefs,
//     resolvers,
//     introspection: true,
//     plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
// });

// exports.handler = server.createHandler();