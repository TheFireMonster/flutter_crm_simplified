"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessagesConversations1757556523081 = void 0;
class ChatMessagesConversations1757556523081 {
    name = 'ChatMessagesConversations1757556523081';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "conversation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "linkId" character varying NOT NULL, "customerName" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0a0ebbdfe2a8156d2d722341716" UNIQUE ("linkId"), CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sender" character varying NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "conversationId" uuid, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TABLE "conversation"`);
    }
}
exports.ChatMessagesConversations1757556523081 = ChatMessagesConversations1757556523081;
//# sourceMappingURL=1757556523081-chatMessagesConversations.js.map