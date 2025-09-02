"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const customers_service_1 = require("./customers.service");
describe('CustomersService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [customers_service_1.CustomersService],
        }).compile();
        service = module.get(customers_service_1.CustomersService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=customers.service.spec.js.map