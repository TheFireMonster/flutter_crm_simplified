import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameConversationAndMessageTables1762650000000 implements MigrationInterface {
    name = 'RenameConversationAndMessageTables1762650000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        
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

    public async down(queryRunner: QueryRunner): Promise<void> {
        
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
