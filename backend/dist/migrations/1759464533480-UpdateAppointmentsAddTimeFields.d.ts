import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdateAppointmentsAddTimeFields1759464533480 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
