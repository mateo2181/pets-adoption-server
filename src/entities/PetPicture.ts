import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Pet } from "./Pet";

@ObjectType()
@Entity('pets_pictures')
export class PetPicture extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  path!: string;

  @Field()
  @Column()
  @CreateDateColumn()
  created_at!: string;

  @Field(() => Pet)
  @ManyToOne(() => Pet, pet => pet.pictures)
  pet!: Pet;

}