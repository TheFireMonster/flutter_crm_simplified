"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const sales_service_1 = require("./sales.service");
describe('SalesService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [sales_service_1.SalesService],
        }).compile();
        service = module.get(sales_service_1.SalesService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=sales.service.spec.js.map