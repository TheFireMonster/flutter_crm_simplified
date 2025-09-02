"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const customer_reports_service_1 = require("./customer-reports.service");
describe('CustomerReportsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [customer_reports_service_1.CustomerReportsService],
        }).compile();
        service = module.get(customer_reports_service_1.CustomerReportsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=customer-reports.service.spec.js.map