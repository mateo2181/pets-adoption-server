import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class PetsPictures1632500507384 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "pets_pictures",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true
                },
                {
                    name: "path",
                    type: "varchar",
                },
                {
                    name: "pet_id",
                    type: "int",
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'now()'
                }
            ]
        }), true)

        await queryRunner.createForeignKey("pets_pictures", new TableForeignKey({
            name: 'pets_pictures_pet_id',
            columnNames: ["pet_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "pets",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("pets_pictures", 'pets_pictures_pet_id');
        await queryRunner.dropTable("pets_pictures");
    }

}
