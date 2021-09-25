import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class PetsBreed1632320781334 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "pets_breed",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true
                },
                {
                    name: "name",
                    type: "varchar",
                },
                {
                    name: "petsType_id",
                    type: "int",
                }
            ]
        }), true)

        await queryRunner.createForeignKey("pets_breed", new TableForeignKey({
            name: 'pets_breed_petsType_id',
            columnNames: ["petsType_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "pets_type",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("pets_breed", 'pets_breed_petsType_id');
        await queryRunner.dropTable("pets_breed");
    }

}
