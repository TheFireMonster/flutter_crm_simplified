"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const webhook_controller_1 = require("./webhook.controller");
describe('WebhookController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [webhook_controller_1.WebhookController],
        }).compile();
        controller = module.get(webhook_controller_1.WebhookController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=webhook.controller.spec.js.map