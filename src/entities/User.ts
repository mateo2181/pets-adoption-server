import { ObjectType, Field, ID } from "type-graphql";
import { Rol } from "./Role";

@ObjectType()
export class User {
  @Field(type => ID)
  id!: number;

  @Field(() => String, {nullable: true})
  name?: string | null;

  // @Field(() => String, {nullable: true})
  // lastname?: string | null;

  @Field(() => String, {nullable: true})
  email?: string | null;

  @Field(() => String, {nullable: true})
  password?: string | null;

  @Field(() => String, {nullable: true})
  image?: string | null;

  // @Field()
  // google?: boolean;

  @Field(() => Date, {nullable: true})
  emailVerified?: Date | null;

  @Field()
  createdAt?: Date;

  @Field()
  updatedAt?: Date;

  @Field(() => [Rol])
  roles?: Rol[];

}