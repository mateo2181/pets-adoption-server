import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { PetType } from "./PetType";
import { PetBreed } from "./PetBreed";
import { User } from "./User";
import { StatusPet } from "../graphql/types";
import { PetPicture } from "./PetPicture";

@ObjectType()
@Entity('pets')
export class Pet extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field(() => String)
  @Column()
  high!: string;

  @Field(() => PetType)
  @ManyToOne(() => PetType, petType => petType.pets)
  petType!: PetType;

  @Field(() => PetBreed, { nullable: true })
  @ManyToOne(() => PetBreed, petBreed => petBreed.pets, { nullable: true })
  petBreed!: PetBreed;

  @Field(() => User)
  @ManyToOne(() => User)
  creator!: User;

  @Field(() => User)
  @ManyToOne(() => User)
  owner!: User;

  @Field()
  @Column({
    type: "enum",
    enum: StatusPet,
    default: StatusPet.HAS_OWNER
  })
  status!: StatusPet

  @Field(() => [PetPicture])
  @OneToMany(() => PetPicture, petPicture => petPicture.pet)
  pictures!: PetPicture[];

}