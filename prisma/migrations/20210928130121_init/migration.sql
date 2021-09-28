-- CreateEnum
CREATE TYPE "pets_status_enum" AS ENUM ('has_owner', 'adoption', 'lost');

-- CreateTable
CREATE TABLE "pets" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "high" VARCHAR NOT NULL,
    "petTypeId" INTEGER,
    "creatorId" INTEGER,
    "status" "pets_status_enum" NOT NULL DEFAULT E'has_owner',
    "petBreedId" INTEGER,
    "ownerId" INTEGER,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets_breed" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "petTypeId" INTEGER,

    CONSTRAINT "pets_breed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets_pictures" (
    "id" SERIAL NOT NULL,
    "path" VARCHAR NOT NULL,
    "petId" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pets_pictures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets_type" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "pets_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "firstname" VARCHAR NOT NULL,
    "lastname" VARCHAR,
    "email" TEXT NOT NULL,
    "password" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "picture" VARCHAR,
    "google" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RolToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_RolToUser_AB_unique" ON "_RolToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RolToUser_B_index" ON "_RolToUser"("B");

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_petBreedId_fkey" FOREIGN KEY ("petBreedId") REFERENCES "pets_breed"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_petTypeId_fkey" FOREIGN KEY ("petTypeId") REFERENCES "pets_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pets_breed" ADD CONSTRAINT "pets_breed_petTypeId_fkey" FOREIGN KEY ("petTypeId") REFERENCES "pets_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pets_pictures" ADD CONSTRAINT "pets_pictures_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_RolToUser" ADD FOREIGN KEY ("A") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolToUser" ADD FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
