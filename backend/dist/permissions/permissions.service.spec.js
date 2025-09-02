"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const permissions_service_1 = require("./permissions.service");
describe('PermissionsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [permissions_service_1.PermissionsService],
        }).compile();
        service = module.get(permissions_service_1.PermissionsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=permissions.service.spec.js.map