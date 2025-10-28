import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomerIdToSales1762100000000 implements MigrationInterface {
    name = 'AddCustomerIdToSales1762100000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales" ADD "customerId" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "customerId"`);
    }
}
