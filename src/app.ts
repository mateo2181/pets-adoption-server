import 'reflect-metadata';
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-lambda';
import { ApolloServer as ApolloServerExpress } from 'apollo-server-express';
import { buildSchema, buildSchemaSync, registerEnumType } from 'type-graphql';
import { graphqlUploadExpress } from 'graphql-upload';
import cors from 'cors';
import authRouter from './auth';
import { PetResolver, UserResolver } from './graphql/resolvers';
// import { authChecker } from './graphql/authorization/authChecker';
import helper from './auth/helper';
import { prisma } from './prisma';
import { PetsStatusEnum } from './graphql/types';
import fileUpload from 'express-fileupload';
import { PetTypeResolver } from './graphql/resolvers/petTypeResolver';
import { permissions } from './permissions';
import { applyMiddleware } from 'graphql-middleware';

registerEnumType(PetsStatusEnum, {
    name: "PetsStatusEnum", // this one is mandatory
});

(<any>global).cachedSchema = (<any>global).cachedSchema || buildSchemaSync({
        resolvers: [PetResolver, PetTypeResolver, UserResolver],
        // authChecker
    });

// const schema = applyMiddleware((<any>global).cachedSchema, permissions);
const schema = (<any>global).cachedSchema;

function getServer() {
    return new ApolloServer({
        schema,
        context: ({ event }) => {
            console.log({...event});
            return { headers: event.headers, prisma };
        },
    });
}

let server;
const createHandler = async () => {
    console.log('Serverless', 'Initializing...');

    // Create Lambda compatible GraphQL Server
    server = getServer();

    return server.createHandler({
        expressAppFromMiddleware(middleware) {
            const app = express();
            app.use(graphqlUploadExpress());
            app.use(middleware);

            return app;
        },
        expressGetMiddlewareOptions: {
            cors: {
                origin: '*',
                credentials: false,
            },
        },
    });
};

exports.handler = async (event: any, context: any, callback: any) => {
    const lambda = await createHandler();
    return lambda(event, context, () => {});
};

// export async function handler(event: any, ctx: any, callback: any) {
//     return getServer()
//         .then(server => server.createHandler({
//             expressGetMiddlewareOptions: { bodyParserConfig: { limit: '50mb' } },
//             expressAppFromMiddleware(middleware) {
//                 const app = express();
//                 app.use(cors());
//                 app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
//                 app.use(middleware);
//                 return app
//               }
//         }))
//         .then(handler => handler(event, ctx, callback))
// }


/* 
**** Function to run server with express locally. ****
*/
export async function startServerExpress() {
    const app = express();
    
    app.use(express.json());
    app.use(cors());
    // app.use(fileUpload());
    app.use('/auth', authRouter);

    app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
    const server = new ApolloServerExpress({
        schema,
        uploads: false,
        context: ({ req }) => {
            return { ...req, prisma };
        },
        // context: async ({ req }) => {
        //     const token = req.headers.authorization || '';
        //     const user = await helper.getUser(token);
        //     return { prisma, user };
        // },
    })

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });
    return app;
}

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