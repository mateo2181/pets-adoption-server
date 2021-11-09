import { Ctx, Query, Resolver } from "type-graphql";
import { PetType } from "../../entities/PetType";
import { Context } from "../../prisma";

@Resolver(PetType)
export class PetTypeResolver {
    
    @Query(() => [PetType])
    petsType(@Ctx() ctx: Context): Promise<PetType[]> {
        return ctx.prisma.petType.findMany({include: { breeds: true }});
    }
}