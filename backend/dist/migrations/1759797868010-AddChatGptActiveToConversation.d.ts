import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddChatGptActiveToConversation1759797868010 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
