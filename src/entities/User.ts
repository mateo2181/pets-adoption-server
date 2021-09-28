import { ObjectType, Field, ID } from "type-graphql";
import { Rol } from "./Role";

@ObjectType()
export class User {
  @Field()
  id!: number;

  @Field()
  firstname?: string;

  @Field(() => String, {nullable: true})
  lastname?: string | null;

  @Field()
  email?: string;

  @Field(() => String, {nullable: true})
  password?: string | null;

  @Field(() => String, {nullable: true})
  picture?: string | null;

  @Field()
  google?: boolean;

  @Field()
  created_at?: Date;

  @Field(() => [Rol])
  roles?: Rol[];

}