import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultPermissions1756763517560 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO permissions (name, description, "isActive")
            VALUES 
                ('canSendMessage', 'Messaging permission', true),
                ('canGenReports', 'Permission to generate reports', true),
                ('canRegCostumer', 'Permission to register costumers', true)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                await queryRunner.query(`
            DELETE FROM permissions WHERE name IN ('canSendMessage', 'canGenReports', 'canRegCostumer')
        `);
    }
}
