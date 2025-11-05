import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRegistrationCodesTable1762500000000 implements MigrationInterface {
    name = 'CreateRegistrationCodesTable1762500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
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

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_registration_codes_used"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_registration_codes_code"`);
        await queryRunner.query(`DROP TABLE "registration_codes"`);
    }
}