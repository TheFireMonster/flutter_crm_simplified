"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const customer_reports_controller_1 = require("./customer-reports.controller");
describe('CustomerReportsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [customer_reports_controller_1.CustomerReportsController],
        }).compile();
        controller = module.get(customer_reports_controller_1.CustomerReportsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=customer-reports.controller.spec.js.map