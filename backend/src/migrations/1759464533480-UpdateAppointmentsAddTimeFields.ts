import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAppointmentsAddTimeFields1759464533480 implements MigrationInterface {
    name = 'UpdateAppointmentsAddTimeFields1759464533480'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshToken" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshTokenExpiry" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "startTime" TIME NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "endTime" TIME NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "appointmentDate"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "appointmentDate" date NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "appointmentDate"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "appointmentDate" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "endTime"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "startTime"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshTokenExpiry"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
    }

}
