import { AuthChecker } from "type-graphql";
import { User } from "../../entities/User";
import authHelper from '../../auth/helper';
import { Context } from "../../prisma";

export const authChecker: AuthChecker<Context> = ({ context: { headers } }, roles) => {
    return false;
    // if (roles.length === 0) {
    //     // if `@Authorized()`, check only if user exists
    //     return !!user;
    // }
    // // there are some roles defined now

    // if (!user || !user.roles) {
    //     // and if no user, restrict access
    //     return false;
    // }
    // if (user.roles?.some(role => roles.includes(role.name))) {
    //     // grant access if the roles overlap
    //     return true;
    // }
    // no roles matched, restrict access
    return false;
};

export const isOwner = async ({context, petId}: {context: Context, petId: number}) => {
    try {
    const authHeader = context.headers.authorization as string || '';
    const payload = authHelper.getPayloadFromToken(authHeader);
    const res = await context.prisma.pet.count({
        where: {
            id: petId,
            creatorId: payload.userId
        }
    });
    console.log(res > 0);
    return res > 0;
    } catch(ex) {
        return false;
    };
}