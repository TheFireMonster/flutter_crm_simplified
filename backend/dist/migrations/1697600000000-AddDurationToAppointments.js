"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDurationToAppointments1697600000000 = void 0;
class AddDurationToAppointments1697600000000 {
    name = 'AddDurationToAppointments1697600000000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "duration" integer`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "duration"`);
    }
}
exports.AddDurationToAppointments1697600000000 = AddDurationToAppointments1697600000000;
//# sourceMappingURL=1697600000000-AddDurationToAppointments.js.map