import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AllowNullFieldsCustomers1761513360265 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
