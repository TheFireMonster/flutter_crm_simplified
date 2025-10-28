import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDurationToAppointments1697600000000 implements MigrationInterface {
    name = 'AddDurationToAppointments1697600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "duration" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "duration"`);
    }
}
