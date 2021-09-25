import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class Pets1632321867014 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "pets",
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
                    name: "high",
                    type: "varchar",
                },
                {
                    name: "petsType_id",
                    type: "int",
                },
                {
                    name: "petsBreed_id",
                    type: "int",
                },
                {
                    name: "creator_id",
                    type: "int",
                },
                {
                    name: "owner_id",
                    type: "int",
                    isNullable: true
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['has_owner', 'adoption', 'lost'] 
                }
            ]
        }), true)

        await queryRunner.createForeignKey("pets", new TableForeignKey({
            name: 'pets_petsType_id',
            columnNames: ["petsType_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "pets_type",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("pets", new TableForeignKey({
            name: 'pets_petsBreed_id',
            columnNames: ["petsBreed_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "pets_breed",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("pets", new TableForeignKey({
            name: 'pets_creator_id',
            columnNames: ["creator_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "SET NULL"
        }));

        await queryRunner.createForeignKey("pets", new TableForeignKey({
            name: 'pets_owner_id',
            columnNames: ["owner_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "SET NULL"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("pets", 'pets_petsType_id');
        await queryRunner.dropForeignKey("pets", 'pets_petsBreed_id');
        await queryRunner.dropForeignKey("pets", 'pets_creator_id');
        await queryRunner.dropForeignKey("pets", 'pets_owner_id');
        await queryRunner.dropTable("pets");
    }

}
