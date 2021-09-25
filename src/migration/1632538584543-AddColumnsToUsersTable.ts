import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnsToUsersTable1632538584543 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "lastname" DROP NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "picture" VARCHAR DEFAULT NULL;`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "google" BOOLEAN DEFAULT FALSE;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "picture", DROP COLUMN "google";`);
    }

}
