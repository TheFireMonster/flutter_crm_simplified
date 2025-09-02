"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const permissions_controller_1 = require("./permissions.controller");
describe('PermissionsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [permissions_controller_1.PermissionsController],
        }).compile();
        controller = module.get(permissions_controller_1.PermissionsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=permissions.controller.spec.js.map