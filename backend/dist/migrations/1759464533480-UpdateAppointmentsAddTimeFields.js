"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAppointmentsAddTimeFields1759464533480 = void 0;
class UpdateAppointmentsAddTimeFields1759464533480 {
    name = 'UpdateAppointmentsAddTimeFields1759464533480';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshToken" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshTokenExpiry" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "startTime" TIME NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "endTime" TIME NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "appointmentDate"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "appointmentDate" date NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "appointmentDate"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "appointmentDate" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "endTime"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "startTime"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshTokenExpiry"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
    }
}
exports.UpdateAppointmentsAddTimeFields1759464533480 = UpdateAppointmentsAddTimeFields1759464533480;
//# sourceMappingURL=1759464533480-UpdateAppointmentsAddTimeFields.js.map