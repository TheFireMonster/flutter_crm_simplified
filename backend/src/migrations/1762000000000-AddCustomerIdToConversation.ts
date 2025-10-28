import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCustomerIdToConversation1762000000000 implements MigrationInterface {
    name = 'AddCustomerIdToConversation1762000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('conversation', new TableColumn({
            name: 'customerId',
            type: 'int',
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('conversation', 'customerId');
    }
}
