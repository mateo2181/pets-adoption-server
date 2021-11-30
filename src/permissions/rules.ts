import { rule, and, or, not } from 'graphql-shield'
// import { verifyToken } from '../auth';
import { Context } from '../prisma';
import authHelper from '../auth/helper';

export const isAdmin = rule()(async (parent, args, ctx: Context, info) => {
    console.log(ctx.headers);
    const authHeader = ctx.headers['Authorization'] as string || '';
    console.log(authHeader);
    const user = await authHelper.getUser(authHeader);
    console.log({user});
    return (!user || !user.roles) ? true : user.roles?.some(rol => rol.name === 'ADMIN');
    //  return !!user;
})

export const isAuthenticated = rule()(async (parent, args, ctx: Context, info) => {
    const authHeader = ctx.headers.authorization || '';
    const user = await authHelper.getUser(authHeader);
    return !!user;
  },
)