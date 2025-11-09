"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TruncateAllTables1763000000000 = void 0;
class TruncateAllTables1763000000000 {
    async up(queryRunner) {
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
    async down(queryRunner) {
    }
}
exports.TruncateAllTables1763000000000 = TruncateAllTables1763000000000;
//# sourceMappingURL=1763000000000-TruncateAllTables.js.map