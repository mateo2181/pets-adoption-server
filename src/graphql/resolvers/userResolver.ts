import { Resolver, Query, Mutation, Field, InputType, Arg } from "type-graphql";
import { User } from "../../entities/User";

@InputType()
class SignUpInput {
  @Field()
  firstname!: string;

  @Field()
  lastname!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}





@Resolver()
export class UserResolver {
  
}