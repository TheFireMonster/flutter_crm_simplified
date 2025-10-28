import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSalesCustomerFK1762200000000 implements MigrationInterface {
    name = 'AddSalesCustomerFK1762200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Nullify any customerId values that do not exist in customers to avoid FK errors
        await queryRunner.query(`UPDATE "sales" SET "customerId" = NULL WHERE "customerId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM "customers" c WHERE c.id = "sales"."customerId")`);
        await queryRunner.query(`ALTER TABLE "sales" ADD CONSTRAINT "FK_sales_customer_customerId" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_sales_customerId" ON "sales" ("customerId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_sales_customerId"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_sales_customer_customerId"`);
    }
}
