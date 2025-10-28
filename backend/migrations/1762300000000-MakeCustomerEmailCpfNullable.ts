import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCustomerEmailCpfNullable1762300000000 implements MigrationInterface {
    name = 'MakeCustomerEmailCpfNullable1762300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Allow creating lightweight leads without email/cpf (they can be filled later)
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "cpf" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert to NOT NULL (may fail if nulls exist) - this is the reversible inverse
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "cpf" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "email" SET NOT NULL`);
    }

}
