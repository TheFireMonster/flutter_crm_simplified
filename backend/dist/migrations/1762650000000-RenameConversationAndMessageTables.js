"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameConversationAndMessageTables1762650000000 = void 0;
class RenameConversationAndMessageTables1762650000000 {
    name = 'RenameConversationAndMessageTables1762650000000';
    async up(queryRunner) {
        const conversationExists = await queryRunner.hasTable("conversation");
        const messageExists = await queryRunner.hasTable("message");
        if (conversationExists) {
            await queryRunner.query(`ALTER TABLE "conversation" RENAME TO "conversations"`);
        }
        if (messageExists) {
            await queryRunner.query(`ALTER TABLE "message" RENAME TO "messages"`);
        }
        if (messageExists && conversationExists) {
            const foreignKeys = await queryRunner.query(`
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'messages' 
                AND constraint_type = 'FOREIGN KEY'
            `);
        }
    }
    async down(queryRunner) {
        const conversationsExists = await queryRunner.hasTable("conversations");
        const messagesExists = await queryRunner.hasTable("messages");
        if (messagesExists) {
            await queryRunner.query(`ALTER TABLE "messages" RENAME TO "message"`);
        }
        if (conversationsExists) {
            await queryRunner.query(`ALTER TABLE "conversations" RENAME TO "conversation"`);
        }
    }
}
exports.RenameConversationAndMessageTables1762650000000 = RenameConversationAndMessageTables1762650000000;
//# sourceMappingURL=1762650000000-RenameConversationAndMessageTables.js.map