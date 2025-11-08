import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddAccessTokenToConversations1762564471165 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
