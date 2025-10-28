"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAppointmentsCustomerAndServicesTable1697539200000 = void 0;
const typeorm_1 = require("typeorm");
class AddAppointmentsCustomerAndServicesTable1697539200000 {
    async up(queryRunner) {
        const hasAppointments = await queryRunner.hasTable('appointments');
        if (hasAppointments) {
            const hasCustomerId = await queryRunner.hasColumn('appointments', 'customerId');
            if (!hasCustomerId) {
                await queryRunner.addColumn('appointments', new typeorm_1.TableColumn({
                    name: 'customerId',
                    type: 'integer',
                    isNullable: true,
                }));
            }
            const hasCustomerName = await queryRunner.hasColumn('appointments', 'customerName');
            if (!hasCustomerName) {
                await queryRunner.addColumn('appointments', new typeorm_1.TableColumn({
                    name: 'customerName',
                    type: 'varchar',
                    length: '100',
                    isNullable: true,
                }));
            }
        }
        const hasServices = await queryRunner.hasTable('services');
        if (!hasServices) {
            await queryRunner.createTable(new typeorm_1.Table({
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
    async down(queryRunner) {
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
exports.AddAppointmentsCustomerAndServicesTable1697539200000 = AddAppointmentsCustomerAndServicesTable1697539200000;
//# sourceMappingURL=1697539200000-AddAppointmentsCustomerAndServicesTable.js.map