import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultPermissions1756763517560 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO permissions (name, description, "isActive")
            VALUES 
                ('canSendMessage', 'Messaging permission', true),
                ('canGenReports', 'Permission to generate reports', true),
                ('canRegCostumer', 'Permission to register customers', true),
                ('canEditCustomer', 'Permission to edit customer data', true),
                ('canDeleteCustomer', 'Permission to delete a customer', true),
                ('canViewSales', 'Permission to view sales records', true),
                ('canEditSales', 'Permission to edit sales records', true),
                ('canDeleteSales', 'Permission to delete sales records', true),
                ('canAccessAnalytics', 'Permission to access CRM analytics dashboard', true),
                ('canExportData', 'Permission to export CRM data', true)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
                await queryRunner.query(`
            DELETE FROM permissions WHERE name IN ('canSendMessage', 'canGenReports', 'canRegCostumer', 'canEditCustomer', 'canDeleteCustomer', 'canViewSales', 'canEditSales', 'canDeleteSales', 'canAccessAnalytics', 'canExportData')
        `);
    }
}
