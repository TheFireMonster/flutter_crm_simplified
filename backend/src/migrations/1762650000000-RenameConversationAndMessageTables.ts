import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameConversationAndMessageTables1762650000000 implements MigrationInterface {
    name = 'RenameConversationAndMessageTables1762650000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if old tables exist before renaming
        const conversationExists = await queryRunner.hasTable("conversation");
        const messageExists = await queryRunner.hasTable("message");

        if (conversationExists) {
            await queryRunner.query(`ALTER TABLE "conversation" RENAME TO "conversations"`);
        }

        if (messageExists) {
            await queryRunner.query(`ALTER TABLE "message" RENAME TO "messages"`);
        }

        // Update foreign key constraint name if it exists
        // The FK from messages to conversations might need updating
        if (messageExists && conversationExists) {
            // Get the existing FK constraint name
            const foreignKeys = await queryRunner.query(`
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'messages' 
                AND constraint_type = 'FOREIGN KEY'
            `);

            // This handles the FK reference update automatically in most cases
            // PostgreSQL updates the references when tables are renamed
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back to singular names
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
