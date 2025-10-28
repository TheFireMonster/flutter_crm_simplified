"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCustomerIdToConversation1762000000000 = void 0;
const typeorm_1 = require("typeorm");
class AddCustomerIdToConversation1762000000000 {
    name = 'AddCustomerIdToConversation1762000000000';
    async up(queryRunner) {
        await queryRunner.addColumn('conversation', new typeorm_1.TableColumn({
            name: 'customerId',
            type: 'int',
            isNullable: true,
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('conversation', 'customerId');
    }
}
exports.AddCustomerIdToConversation1762000000000 = AddCustomerIdToConversation1762000000000;
//# sourceMappingURL=1762000000000-AddCustomerIdToConversation.js.map