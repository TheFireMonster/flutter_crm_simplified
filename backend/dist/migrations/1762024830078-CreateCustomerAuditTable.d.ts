import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateCustomerAuditTable1762024830078 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
