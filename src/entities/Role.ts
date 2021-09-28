import { ObjectType, Field, ID } from "type-graphql";

@ObjectType()
export class Rol {
  @Field()
  id?: number;

  @Field()
  name!: string;

}