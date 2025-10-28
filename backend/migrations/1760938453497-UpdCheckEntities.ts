import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdCheckEntities1760938453497 implements MigrationInterface {
    name = 'UpdCheckEntities1760938453497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "productName"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "sales" ADD "serviceName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sales" ADD "price" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "updatedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "updatedAt" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "updatedAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP COLUMN "serviceName"`);
        await queryRunner.query(`ALTER TABLE "sales" ADD "amount" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sales" ADD "productName" character varying(100) NOT NULL`);
    }

}
