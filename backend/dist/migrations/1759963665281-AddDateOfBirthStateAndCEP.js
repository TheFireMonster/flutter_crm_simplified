"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDateOfBirthStateAndCEP1759963665281 = void 0;
class AddDateOfBirthStateAndCEP1759963665281 {
    name = 'AddDateOfBirthStateAndCEP1759963665281';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "customers" ADD "dateOfBirth" date`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "state" character varying(2)`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "cep" character varying(9)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "cep"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "dateOfBirth"`);
    }
}
exports.AddDateOfBirthStateAndCEP1759963665281 = AddDateOfBirthStateAndCEP1759963665281;
//# sourceMappingURL=1759963665281-AddDateOfBirthStateAndCEP.js.map