"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRegistrationCodesTable1762500000000 = void 0;
class CreateRegistrationCodesTable1762500000000 {
    name = 'CreateRegistrationCodesTable1762500000000';
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "registration_codes" (
                "id" SERIAL NOT NULL,
                "code" character varying(32) NOT NULL,
                "used" boolean NOT NULL DEFAULT false,
                "usedAt" TIMESTAMP,
                "usedByEmail" character varying(100),
                "expiresAt" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_registration_codes_code" UNIQUE ("code"),
                CONSTRAINT "PK_registration_codes" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_registration_codes_code" ON "registration_codes" ("code")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_registration_codes_used" ON "registration_codes" ("used")
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_registration_codes_used"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_registration_codes_code"`);
        await queryRunner.query(`DROP TABLE "registration_codes"`);
    }
}
exports.CreateRegistrationCodesTable1762500000000 = CreateRegistrationCodesTable1762500000000;
//# sourceMappingURL=1762500000000-CreateRegistrationCodesTable.js.map