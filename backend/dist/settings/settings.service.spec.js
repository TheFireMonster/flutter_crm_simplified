"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const settings_service_1 = require("./settings.service");
describe('SettingsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [settings_service_1.SettingsService],
        }).compile();
        service = module.get(settings_service_1.SettingsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=settings.service.spec.js.map