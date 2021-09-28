import { ObjectType, Field, ID } from "type-graphql";
import { Pet } from "./Pet";

@ObjectType()
export class PetPicture {
  @Field()
  id!: number;

  @Field()
  path!: string;

  @Field()
  created_at!: Date;

  @Field(() => Pet, { nullable: true })
  pet?: Pet;

}