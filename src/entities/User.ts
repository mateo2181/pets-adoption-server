import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique, ManyToMany, JoinTable } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import * as bcrypt from "bcrypt";
import { Role } from "./Role";

@ObjectType()
@Entity('users')
@Unique(["email"])
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  firstname!: string;

  @Field()
  @Column({ nullable: true })
  lastname!: string;

  @Field()
  @Column()
  email!: string;

  @Field()
  @Column({ nullable: true })
  password!: string;

  @Field()
  @Column({ nullable: true })
  picture!: string;

  @Field()
  @Column({ default: false })
  google!: boolean;

  @Field()
  @Column()
  @CreateDateColumn()
  created_at!: string;

  @ManyToMany(type => Role)
  @JoinTable({
    name: "users_roles", // table name for the junction table of this relation
    joinColumn: {
      name: "user_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "role_id",
      referencedColumnName: "id"
    }
  })
  roles!: Role[];

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }

}