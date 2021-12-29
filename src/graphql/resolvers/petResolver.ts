import { GraphQLUpload, FileUpload } from "graphql-upload";
import { Resolver, Query, Mutation, Field, InputType, Arg, Authorized, Ctx, ID } from "type-graphql";
import { Pet } from "../../entities/Pet";
import { PetPicture } from "../../entities/PetPicture";
import { Context } from '../../prisma';
import { File, PetsStatusEnum } from "../types";
import { AwsService } from "../../utils/aws";
import { getDefaultUrlImageByPetType } from "../helpers";
import authHelper from '../../auth/helper';
import { isOwner } from "../authorization/authChecker";
import { GraphQLError } from "graphql";
import { ApolloError } from "apollo-server-lambda";
require('dotenv').config();

const RADIUS = 10000;

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

  @Field()
  latitude!: number;

  @Field()
  longitude!: number;

  @Field()
  address!: string;
}

@InputType()
class PetEditInput extends PetInput {
  @Field()
  id!: number;
}

@InputType()
class PetFilters {
  @Field({ nullable: true })
  petTypeId?: number;

  @Field({ nullable: true })
  petBreedId?: number;

  @Field({ defaultValue: 5 })
  limit?: number;

  @Field({ nullable: true })
  latitude?: number;

  @Field({ nullable: true })
  longitude?: number;

  @Field({ nullable: true })
  status?: 'has_owner' | 'has_owner' | 'lost';
}

@InputType()
class MyPetFilters extends PetFilters {

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
    if(filters.latitude && filters.longitude) {
      const query = await ctx.prisma.$queryRaw<{id: number}[]>`SELECT id FROM "pets" WHERE ST_DWithin(ST_MakePoint(longitude, latitude), ST_MakePoint(${filters.longitude}, ${filters.latitude})::geography, ${RADIUS} * 1000);`;
      where['id'] = { in: query.map(({ id }) => id) };
    }
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
      include: { breed: true, type: true, pictures: true, owner: true, creator: true },
      orderBy: [{ created_at: 'desc' }],
      take: filters.limit
    }).then((pets: Pet[]) => {
      return pets.map(pet => ({
        ...pet,
        pictureDefault: pet.pictures?.length ? pet.pictures[0] : { path: getDefaultUrlImageByPetType('default')}
        // pictures: pet.pictures?.map(picture => ({ ...picture, url: this.awsService.getPubicUrlFromFile(picture.path) }))
      }));
    });
  }

  @Query(() => [Pet])
  async myPets(@Arg('filters', () => MyPetFilters!) filters: MyPetFilters, @Ctx() { prisma, headers }: Context): Promise<Pet[] | ApolloError> {
    try {
      let where: any = {};
      const authHeader = headers.authorization as string || '';
      const payload = authHelper.getPayloadFromToken(authHeader);

      if (filters.petTypeId) {
        where['petTypeId'] = { equals: filters.petTypeId };
      }
      if (filters.petBreedId) {
        where['petBreedId'] = { equals: filters.petBreedId };
      }
      if (filters.status) {
        where['status'] = { equals: filters.status };
      }
      where['creatorId'] = { equals: payload.userId };

      return prisma.pet.findMany({
        where,
        include: { breed: true, type: true, pictures: true, creator: true },
        orderBy: [{ created_at: 'desc' }],
        take: filters.limit
      }).then((pets: Pet[]) => {
        return pets.map(pet => ({
          ...pet,
          pictureDefault: pet.pictures?.length ? pet.pictures[0] : { path: getDefaultUrlImageByPetType('default')}
        }));
      });
    } catch (error: any) {
      console.log(error);
      return error;
    }
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
    return pet;
  }

  // @Authorized(["ADMIN"])
  @Mutation(() => Pet)
  async createPet(@Arg('variables', () => PetInput) variables: PetInput, @Ctx() { prisma, headers }: Context) {
    console.log(headers.authorization);
    const authHeader = headers.authorization as string || '';
    const payload = authHelper.getPayloadFromToken(authHeader);
    console.log(payload);

    const { name, high, petTypeId, petBreedId, latitude, longitude, address } = variables;
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
        latitude,
        longitude,
        address,
        type: {
          connect: { id: petType.id }
        },
        breed: {
          connect: { id: petBreed.id }
        },
        creator: {
          connect: { id: payload.userId }
        }
      }
    });
    return newPet;
  }

  @Mutation(() => Pet)
  async updatePet(@Arg('variables', () => PetEditInput) variables: PetEditInput, @Ctx() context: Context) {
    try {
      const { id, name, high, petTypeId, petBreedId, latitude, longitude, address } = variables;
      const isPetOwner = await isOwner({context, petId: id});
      if(!isPetOwner) {
        console.log("ERROR OWNER");
        throw new Error("You are not the pet owner");
      }

      const petType = await context.prisma.petType.findUnique({ where: { id: petTypeId } });
      if (!petType) {
        throw new Error("Invalid Pet Type ID");
      }
      const petBreed = await context.prisma.petBreed.findUnique({ where: { id: petBreedId } });
      if (!petBreed) {
        throw new Error("Invalid Pet Breed ID");
      }
      const pet = await context.prisma.pet.update({
        where: {id},
        data: {
          name,
          high,
          latitude,
          longitude,
          address,
          type: {
            connect: { id: petType.id }
          },
          breed: {
            connect: { id: petBreed.id }
          },
        }
      });
      return pet;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  @Mutation(() => PetPicture)
  async addAvatar(
    @Arg("file", () => GraphQLUpload) file: Promise<FileUpload>,
    @Arg("petId", () => ID) petId: number,
    @Ctx() { prisma, headers }: Context
  ): Promise<PetPicture | any> {

    try {
      const authHeader = headers.authorization as string || '';
      const payload = authHelper.getPayloadFromToken(authHeader);

      if (!petId) throw new Error("Invalid Pet ID");
      const pet = await prisma.pet.findUnique({ where: { id: Number(petId) } });
      if (!pet) throw new Error("Pet not found");
      if(pet.creatorId !== payload.userId) {
        throw new Error("Shoud be the pet owner to add an picture");
      }


      const data = await this.awsService.singleFileUploadResolver({ file });
      const picture = await prisma.petPictures.create({
        data: {
          path: data.url,
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
    @Ctx() { prisma, headers }: Context
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