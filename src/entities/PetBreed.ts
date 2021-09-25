import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Pet } from "./Pet";
import { PetType } from "./PetType";

@ObjectType()
@Entity('pets_breed')
export class PetBreed extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @OneToMany(() => Pet, pet => pet.petBreed)
  pets!: Pet[];

  @ManyToOne(() => PetType)
  petType!: PetType;

}