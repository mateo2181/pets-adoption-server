import { GraphQLUpload, FileUpload } from "graphql-upload";
import { Resolver, Query, Mutation, Field, InputType, Arg, Authorized, Ctx, ID } from "type-graphql";
import { Pet } from "../../entities/Pet";
import { PetBreed } from "../../entities/PetBreed";
import { PetType } from "../../entities/PetType";
import { createWriteStream } from "fs";
import path from 'path';
import { PetPicture } from "../../entities/PetPicture";
import { Context } from '../../prisma';

@InputType()
class PetInput {
  @Field()
  name!: string;

  @Field()
  high!: string;

  @Field()
  petTypeId!: number;

  @Field()
  petBreedId!: number;
}

@Resolver(Pet)
export class PetResolver {
  @Authorized()
  @Query(() => [Pet])
  async pets(@Ctx() ctx: Context): Promise<Pet[]> {
    return ctx.prisma.pet.findMany({include: {breed: true, type: true, pictures: true, owner: true, creator: true}});
  }
  @Authorized(["ADMIN"])
  @Mutation(() => Pet)
  async createPet(@Arg('variables', () => PetInput) variables: PetInput, @Ctx() { prisma, user }: Context) {
    const { name, high, petTypeId, petBreedId } = variables;
    const petType = await prisma.petType.findUnique({ where: { id: petTypeId } });
    if (!petType) {
      throw new Error("Invalid Pet Type ID");
    }
    const petBreed = await prisma.petBreed.findUnique({ where: { id: petBreedId } });
    if (!petBreed) {
      throw new Error("Invalid Pet Breed ID");
    }
    const newPet = await prisma.pet.create({
      data: {
        name,
        high,
        type: {
          connect: { id: petType.id }
        },
        breed: {
          connect: { id: petBreed.id }
        },
        creator: {
          connect: { id: user.id }
        }
      }
    });
    return newPet;
  }

  @Mutation(() => PetPicture)
  async addAvatar(
    @Arg("file", () => GraphQLUpload) file: FileUpload,
    @Arg("petId", () => ID) petId: number,
    @Ctx() { prisma, user }: Context
  ): Promise<PetPicture> {
    if (!petId) throw new Error("Invalid Pet ID");
    const pet = await prisma.pet.findUnique({ where: { id: Number(petId) } });
    if (!pet) throw new Error("Pet not found");

    const { createReadStream, filename } = await file;
    const pathPicture = path.join(process.cwd(), `/src/images/${Date.now()}_${filename}`);
    const writableStream = createWriteStream(pathPicture, { autoClose: true });

    return new Promise((resolve, reject) => {
      createReadStream()
        .pipe(writableStream)
        .on("finish", async () => {
          const picture = await prisma.petPictures.create({
            data: {
              path: pathPicture,
              pet: {
                connect: { id: pet.id }
              }
            }
          });
          resolve(picture);
        })
        .on("error", (err) => reject(err));
    });

  }
}