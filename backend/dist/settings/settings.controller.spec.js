"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const settings_controller_1 = require("./settings.controller");
describe('SettingsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [settings_controller_1.SettingsController],
        }).compile();
        controller = module.get(settings_controller_1.SettingsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=settings.controller.spec.js.map