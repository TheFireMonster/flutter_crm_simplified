import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomerAuditTable1762024830078 implements MigrationInterface {
    name = 'CreateCustomerAuditTable1762024830078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customer_audit" ("id" SERIAL NOT NULL, "customerId" integer, "conversationLinkId" character varying, "changedBy" character varying, "changes" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_aa69d52dd6d8bab6f2826a27144" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "customer_audit"`);
    }

}
