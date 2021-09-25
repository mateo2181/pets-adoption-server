import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Pet } from "./Pet";

@ObjectType()
@Entity('pets_type')
export class PetType extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @OneToMany(() => Pet, pet => pet.petType)
  pets!: Pet[];

}