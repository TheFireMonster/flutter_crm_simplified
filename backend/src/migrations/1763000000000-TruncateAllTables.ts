import { MigrationInterface, QueryRunner } from "typeorm";

export class TruncateAllTables1763000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Truncate all tables and restart identity
        await queryRunner.query(`
            TRUNCATE TABLE 
                customers, 
                sales, 
                appointments, 
                services, 
                users, 
                messages, 
                conversations, 
                ai_actions, 
                customer_audit
            RESTART IDENTITY CASCADE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
