import { GraphQLUpload, FileUpload } from "graphql-upload";
import { Resolver, Query, Mutation, Field, InputType, Arg, Authorized, Ctx, Int } from "type-graphql";
import { getRepository } from "typeorm";
import { Pet } from "../../entities/Pet";
import { PetBreed } from "../../entities/PetBreed";
import { PetType } from "../../entities/PetType";
import { Context } from "../types";
import { createWriteStream } from "fs";
import path from 'path';
import { PetPicture } from "../../entities/PetPicture";

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

@Resolver()
export class PetResolver {
  @Authorized()
  @Query(() => [Pet])
  pets() {
    return Pet.find({ relations: ['petType', 'petBreed', 'owner', 'creator', 'pictures'] });
  }
  @Authorized(["ADMIN"])
  @Mutation(() => Pet)
  async createPet(@Arg('variables', () => PetInput) variables: PetInput, @Ctx() { user }: Context) {
    const { name, high, petTypeId, petBreedId } = variables;
    const petType = await PetType.findOne(petTypeId);
    if (!petType) {
      throw new Error("Invalid Pet Type ID");
    }
    const petBreed = await PetBreed.findOne(petBreedId);
    if (!petBreed) {
      throw new Error("Invalid Pet Breed ID");
    }
    const newPet = Pet.create({
      name,
      high,
      petType,
      petBreed,
      creator: user
    });
    return await newPet.save();
  }

  @Mutation(() => PetPicture)
  async addAvatar(
    @Arg("file", () => GraphQLUpload) file: FileUpload,
    @Arg("petId", () => Int) petId: typeof Int,
    @Ctx() { user }: Context
  ): Promise<PetPicture> {
    if (!petId) throw new Error("Invalid Pet ID");
    const pet = await Pet.findOne(petId);
    if (!pet) throw new Error("Pet not found");

    const { createReadStream, filename } = await file;
    const pathPicture = path.join(process.cwd(), `/src/images/${Date.now()}_${filename}`);
    const writableStream = createWriteStream(pathPicture, { autoClose: true });

    return new Promise((resolve, reject) => {
      createReadStream()
        .pipe(writableStream)
        .on("finish", async () => {
          resolve(PetPicture
            .create({ path: pathPicture, pet })
            .save()
          );
        })
        .on("error", (err) => reject(err));
    });

  }
}