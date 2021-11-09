import { GraphQLUpload, FileUpload } from "graphql-upload";
import { Resolver, Query, Mutation, Field, InputType, Arg, Authorized, Ctx, ID } from "type-graphql";
import { Pet } from "../../entities/Pet";
import { PetBreed } from "../../entities/PetBreed";
import { PetType } from "../../entities/PetType";
import { PetPicture } from "../../entities/PetPicture";
import { Context } from '../../prisma';
import { File, PetsStatusEnum } from "../types";
import { AwsService } from "../../utils/aws";
import { getDefaultImageByPetType } from "../helpers";

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

@InputType()
class PetFilters {
  @Field({ nullable: true })
  petTypeId?: number;

  @Field({ nullable: true })
  petBreedId?: number;

  @Field({ nullable: true })
  status?: PetsStatusEnum;
}

@Resolver(Pet)
export class PetResolver {

  constructor(private awsService: AwsService) {
    this.awsService = new AwsService();
  }

  // @Authorized()
  @Query(() => [Pet])
  async pets(@Arg('filters', () => PetFilters!) filters: PetFilters, @Ctx() ctx: Context): Promise<Pet[]> {
    let where: any = {};
    if (filters.petTypeId) {
      where['petTypeId'] = { equals: filters.petTypeId };
    }
    if (filters.petBreedId) {
      where['petBreedId'] = { equals: filters.petBreedId };
    }
    if (filters.status) {
      where['status'] = { equals: filters.status };
    }
    // const img = this.awsService.getPubicUrlFromFile('1632940950135_labrador.jpg');
    // console.log(img);
    return ctx.prisma.pet.findMany({
      where,
      include: { breed: true, type: true, pictures: true, owner: true, creator: true }
    }).then((pets: Pet[]) => {
      return pets.map(pet => ({
        ...pet,
        pictureDefault: pet.pictures?.length ? { ...pet.pictures[0], url: this.awsService.getPubicUrlFromFile(pet.pictures[0].path || '') }
                                             : { url: this.awsService.getPubicUrlFromFile(getDefaultImageByPetType(pet.type?.name || '') || '')}

        // pictures: pet.pictures?.map(picture => ({ ...picture, url: this.awsService.getPubicUrlFromFile(picture.path) }))
      }));
    });
  }

  @Query(() => Pet)
  async pet(@Arg('id', () => Number!) id: number, @Ctx() ctx: Context): Promise<Pet | null> {
    const pet = await ctx.prisma.pet.findUnique({
      where: { id },
      include: { breed: true, type: true, pictures: true, owner: true, creator: true }
    });

    if (!pet) {
      throw new Error("Pet not found");
    }
    return {
      ...pet,
      pictures: pet.pictures?.map(picture => ({ ...picture, url: this.awsService.getPubicUrlFromFile(picture.path) }))
    };
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
    @Arg("file", () => GraphQLUpload) file: Promise<FileUpload>,
    @Arg("petId", () => ID) petId: number,
    @Ctx() { prisma, user }: Context
  ): Promise<PetPicture | any> {

    try {
      if (!petId) throw new Error("Invalid Pet ID");
      const pet = await prisma.pet.findUnique({ where: { id: Number(petId) } });
      if (!pet) throw new Error("Pet not found");


      const data = await this.awsService.singleFileUploadResolver({ file });
      const picture = await prisma.petPictures.create({
        data: {
          path: data.filePath,
          pet: {
            connect: { id: pet.id }
          }
        }
      });
      return picture;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  @Mutation(() => PetPicture)
  async removeAvatar(
    @Arg("petId", () => ID) petId: number,
    @Arg("petPictureId", () => ID) petPictureId: number,
    @Ctx() { prisma, user }: Context
  ): Promise<PetPicture | any> {

    try {
      if (!petId) throw new Error("Invalid Pet ID");
      const pet = await prisma.pet.findUnique({ where: { id: Number(petId) } });
      if (!pet) throw new Error("Pet not found");
      const petPicture = await prisma.petPictures.findUnique({ where: { id: Number(petPictureId) } });
      if (!petPicture) throw new Error("Pet Picture not found");

      const fileDeleted = await this.awsService.deleteFile(petPicture.path);
      if (!fileDeleted) {
        throw new Error("Pet Picture could not be deleted");
      }
      const picture = await prisma.petPictures.delete({
        where: { id: Number(petPictureId) }
      });
      return picture;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}