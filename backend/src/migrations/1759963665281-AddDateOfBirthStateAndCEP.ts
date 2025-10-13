import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDateOfBirthStateAndCEP1759963665281 implements MigrationInterface {
    name = 'AddDateOfBirthStateAndCEP1759963665281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" ADD "dateOfBirth" date`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "state" character varying(2)`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "cep" character varying(9)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "cep"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "dateOfBirth"`);
    }

}
