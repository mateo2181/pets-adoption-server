import { ObjectType, Field, ID } from "type-graphql";
import { Pet } from "./Pet";
import { PetType } from "./PetType";

@ObjectType()
export class PetBreed {
  @Field()
  id!: number;

  @Field()
  name!: string;

  @Field(() => [Pet])
  pets?: Pet[];

  @Field(() => PetType)
  petType?: PetType;

}