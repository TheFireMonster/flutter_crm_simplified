"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIChatController = void 0;
const common_1 = require("@nestjs/common");
const aichat_service_1 = require("./aichat.service");
const prompt_dto_1 = require("../dto/prompt.dto");
let AIChatController = class AIChatController {
    chatGptService;
    constructor(chatGptService) {
        this.chatGptService = chatGptService;
    }
    async ask(body) {
        const response = await this.chatGptService.ask(body.prompt);
        return { response };
    }
};
exports.AIChatController = AIChatController;
__decorate([
    (0, common_1.Post)('ask'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [prompt_dto_1.PromptDto]),
    __metadata("design:returntype", Promise)
], AIChatController.prototype, "ask", null);
exports.AIChatController = AIChatController = __decorate([
    (0, common_1.Controller)('aichat'),
    __metadata("design:paramtypes", [aichat_service_1.AIChatService])
], AIChatController);
//# sourceMappingURL=aichat.controller.js.map