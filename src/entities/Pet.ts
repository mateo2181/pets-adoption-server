import { ObjectType, Field, ID, Int } from "type-graphql";
import { PetType } from "./PetType";
import { PetBreed } from "./PetBreed";
import { User } from "./User";
import { PetsStatusEnum } from "../graphql/types";
import { PetPicture } from "./PetPicture";

@ObjectType()
export class Pet {
  @Field(type => ID)
  id!: number;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  high!: string;

  @Field(() => PetType)
  type?: PetType | null;

  @Field(() => PetBreed)
  breed!: PetBreed | null;

  @Field(() => User)
  creator!: User | null;

  @Field(() => User, {nullable: true})
  owner?: User | null;

  @Field(() => PetsStatusEnum)
  status!: 'has_owner' | 'adoption' | 'lost';

  @Field(() => [PetPicture])
  pictures?: PetPicture[];

  @Field(() => PetPicture, { nullable: true })
  pictureDefault?: PetPicture | null
}