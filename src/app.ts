import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema, registerEnumType } from 'type-graphql';
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


export async function startServer() {
    registerEnumType(PetsStatusEnum, {
        name: "PetsStatusEnum", // this one is mandatory
    });
    const app = express();
    
    app.use(express.json());
    app.use(cors());
    // app.use(fileUpload());
    app.use('/auth', authRouter);

    app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
    const server = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PetResolver, PetTypeResolver, UserResolver],
            authChecker
        }),
        uploads: false,
        context: async ({ req }) => {
            const token = req.headers.authorization || '';
            const user = await helper.getUser(token);
            return { prisma, user };
        },
    })

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });
    return app;
}
