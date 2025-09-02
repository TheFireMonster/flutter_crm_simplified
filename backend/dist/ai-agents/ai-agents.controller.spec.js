"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const ai_agents_controller_1 = require("./ai-agents.controller");
describe('AiAgentsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [ai_agents_controller_1.AiAgentsController],
        }).compile();
        controller = module.get(ai_agents_controller_1.AiAgentsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=ai-agents.controller.spec.js.map