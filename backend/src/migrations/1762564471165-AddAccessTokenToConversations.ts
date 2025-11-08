import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccessTokenToConversations1762564471165 implements MigrationInterface {
    name = 'AddAccessTokenToConversations1762564471165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_registration_codes_code"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_registration_codes_used"`);
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD "accessToken" character varying`);
        await queryRunner.query(`
            UPDATE "conversation" 
            SET "accessToken" = encode(gen_random_bytes(4), 'hex')
            WHERE "accessToken" IS NULL
        `);
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "accessToken" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "accessToken"`);
        await queryRunner.query(`CREATE INDEX "IDX_registration_codes_used" ON "registration_codes" ("used") `);
        await queryRunner.query(`CREATE INDEX "IDX_registration_codes_code" ON "registration_codes" ("code") `);
    }

}
