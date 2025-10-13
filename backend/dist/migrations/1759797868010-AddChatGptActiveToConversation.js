"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddChatGptActiveToConversation1759797868010 = void 0;
class AddChatGptActiveToConversation1759797868010 {
    name = 'AddChatGptActiveToConversation1759797868010';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "conversation" ADD "chatGptActive" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "chatGptActive"`);
    }
}
exports.AddChatGptActiveToConversation1759797868010 = AddChatGptActiveToConversation1759797868010;
//# sourceMappingURL=1759797868010-AddChatGptActiveToConversation.js.map