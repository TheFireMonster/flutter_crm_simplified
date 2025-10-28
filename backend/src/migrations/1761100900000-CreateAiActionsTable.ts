import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAiActionsTable1761100900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('ai_actions');
    if (has) return;

    await queryRunner.createTable(new Table({
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('ai_actions');
    if (!has) return;
    await queryRunner.dropTable('ai_actions');
  }
}
