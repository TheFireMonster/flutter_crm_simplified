"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAiActionsTable1761100900000 = void 0;
const typeorm_1 = require("typeorm");
class CreateAiActionsTable1761100900000 {
    async up(queryRunner) {
        const has = await queryRunner.hasTable('ai_actions');
        if (has)
            return;
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'ai_actions',
            columns: [
                { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                { name: 'requestId', type: 'varchar', isNullable: false },
                { name: 'actionType', type: 'varchar', isNullable: false },
                { name: 'payload', type: 'jsonb', isNullable: true },
                { name: 'resultTable', type: 'varchar', isNullable: true },
                { name: 'resultId', type: 'int', isNullable: true },
                { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
            ],
            uniques: [
                { columnNames: ['requestId'] }
            ]
        }));
    }
    async down(queryRunner) {
        const has = await queryRunner.hasTable('ai_actions');
        if (!has)
            return;
        await queryRunner.dropTable('ai_actions');
    }
}
exports.CreateAiActionsTable1761100900000 = CreateAiActionsTable1761100900000;
//# sourceMappingURL=1761100900000-CreateAiActionsTable.js.map