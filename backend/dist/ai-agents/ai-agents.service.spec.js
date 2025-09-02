"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const ai_agents_service_1 = require("./ai-agents.service");
describe('AiAgentsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [ai_agents_service_1.AiAgentsService],
        }).compile();
        service = module.get(ai_agents_service_1.AiAgentsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=ai-agents.service.spec.js.map