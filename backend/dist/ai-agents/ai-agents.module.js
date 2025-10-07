"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAgentsModule = void 0;
const common_1 = require("@nestjs/common");
const ai_agents_controller_1 = require("./ai-agents.controller");
const ai_agents_service_1 = require("./ai-agents.service");
const chatgpt_module_1 = require("./chatgpt.module");
const chatgpt_controller_1 = require("./chatgpt.controller");
let AiAgentsModule = class AiAgentsModule {
};
exports.AiAgentsModule = AiAgentsModule;
exports.AiAgentsModule = AiAgentsModule = __decorate([
    (0, common_1.Module)({
        imports: [chatgpt_module_1.ChatGptModule],
        controllers: [ai_agents_controller_1.AiAgentsController, chatgpt_controller_1.ChatGptController],
        providers: [ai_agents_service_1.AiAgentsService],
    })
], AiAgentsModule);
//# sourceMappingURL=ai-agents.module.js.map