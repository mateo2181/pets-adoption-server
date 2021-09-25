import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class UsersRoles1632320074958 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "users_roles",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true
                },
                {
                    name: "role_id",
                    type: "int",
                    isNullable: true
                },
                {
                    name: "user_id",
                    type: "int",
                    isNullable: true
                },
            ]
        }), true)

        await queryRunner.createForeignKey("users_roles", new TableForeignKey({
            name: 'users_role_id',
            columnNames: ["role_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "roles",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("users_roles", new TableForeignKey({
            name: 'users_user_id',
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("users", 'users_role_id');
        await queryRunner.dropForeignKey("users", 'users_user_id');
        await queryRunner.dropTable("users_roles");
    }

}
