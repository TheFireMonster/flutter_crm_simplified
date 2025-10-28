import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowNullFieldsCustomers1761513360265 implements MigrationInterface {
    name = 'AllowNullFieldsCustomers1761513360265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "productName"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "sales" ADD "serviceName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sales" ADD "price" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sales" ADD "customerId" integer`);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "cpf" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "UQ_413de651cfd9c576b99cec83fd3" UNIQUE ("cpf")`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "updatedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "updatedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "ai_actions" DROP CONSTRAINT "UQ_1019cf27198b245382ec789c891"`);
        await queryRunner.query(`ALTER TABLE "ai_actions" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sales" ADD CONSTRAINT "FK_3a92cf6add00043cef9833db1cd" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_3a92cf6add00043cef9833db1cd"`);
        await queryRunner.query(`ALTER TABLE "ai_actions" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "ai_actions" ADD CONSTRAINT "UQ_1019cf27198b245382ec789c891" UNIQUE ("requestId")`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "updatedAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "UQ_413de651cfd9c576b99cec83fd3"`);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "cpf" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "customerId"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "serviceName"`);
        await queryRunner.query(`ALTER TABLE "sales" ADD "amount" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sales" ADD "productName" character varying(100) NOT NULL`);
    }

}
