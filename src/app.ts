import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PetResolver } from './graphql/resolvers/pet';
import { UserResolver } from './graphql/resolvers/user';
import authRouter from './auth';
import helper from './auth/helper';
import { authChecker } from './graphql/authorization/authChecker';
import { graphqlUploadExpress } from 'graphql-upload';
import cors from 'cors';

export async function startServer() {
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use('/auth', authRouter);
    app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
    const server = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PetResolver, UserResolver],
            authChecker
        }),
        uploads: false,
        context: async ({ req }) => {
            const token = req.headers.authorization || '';
            const user = await helper.getUser(token);
            return { user };
        },
    })

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });
    return app;
}
