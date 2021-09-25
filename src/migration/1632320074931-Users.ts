import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class Users1632320074931 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "users",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true
                },
                {
                    name: "firstname",
                    type: "varchar",
                },
                {
                    name: "lastname",
                    type: "varchar",
                },
                {
                    name: "email",
                    type: "varchar",
                },
                {
                    name: "password",
                    type: "varchar",
                },
                {
                  name: 'created_at',
                  type: 'timestamp',
                  default: 'now()'
                }
            ]
        }), true);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users");
    }

}
