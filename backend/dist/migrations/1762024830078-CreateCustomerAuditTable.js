"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCustomerAuditTable1762024830078 = void 0;
class CreateCustomerAuditTable1762024830078 {
    name = 'CreateCustomerAuditTable1762024830078';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "customer_audit" ("id" SERIAL NOT NULL, "customerId" integer, "conversationLinkId" character varying, "changedBy" character varying, "changes" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_aa69d52dd6d8bab6f2826a27144" PRIMARY KEY ("id"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "customer_audit"`);
    }
}
exports.CreateCustomerAuditTable1762024830078 = CreateCustomerAuditTable1762024830078;
//# sourceMappingURL=1762024830078-CreateCustomerAuditTable.js.map