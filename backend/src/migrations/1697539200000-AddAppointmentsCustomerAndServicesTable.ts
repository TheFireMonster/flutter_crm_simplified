import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class AddAppointmentsCustomerAndServicesTable1697539200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasAppointments = await queryRunner.hasTable('appointments');
    if (hasAppointments) {
      const hasCustomerId = await queryRunner.hasColumn('appointments', 'customerId');
      if (!hasCustomerId) {
        await queryRunner.addColumn('appointments', new TableColumn({
          name: 'customerId',
          type: 'integer',
          isNullable: true,
        }));
      }
      const hasCustomerName = await queryRunner.hasColumn('appointments', 'customerName');
      if (!hasCustomerName) {
        await queryRunner.addColumn('appointments', new TableColumn({
          name: 'customerName',
          type: 'varchar',
          length: '100',
          isNullable: true,
        }));
      }
    }

    const hasServices = await queryRunner.hasTable('services');
    if (!hasServices) {
      await queryRunner.createTable(new Table({
        name: 'services',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'serviceName',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'numeric',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasServices = await queryRunner.hasTable('services');
    if (hasServices) {
      await queryRunner.dropTable('services');
    }

    const hasCustomerId = await queryRunner.hasColumn('appointments', 'customerId');
    if (hasCustomerId) {
      await queryRunner.dropColumn('appointments', 'customerId');
    }
    const hasCustomerName = await queryRunner.hasColumn('appointments', 'customerName');
    if (hasCustomerName) {
      await queryRunner.dropColumn('appointments', 'customerName');
    }
  }
}
