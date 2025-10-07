import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatGptActiveToConversation1759797868010 implements MigrationInterface {
    name = 'AddChatGptActiveToConversation1759797868010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" ADD "chatGptActive" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "chatGptActive"`);
    }

}
