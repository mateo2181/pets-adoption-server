import { ObjectType, Field, ID } from "type-graphql";
import { Pet } from "./Pet";
import { PetBreed } from "./PetBreed";

@ObjectType()
export class PetType {
  @Field()
  id!: number;

  @Field()
  name!: string;

  @Field(() => [Pet])
  pets?: Pet[];

  @Field(() => [PetBreed])
  breeds?: PetBreed[];

}