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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const conversations_entity_1 = require("../chat/entities/conversations.entity");
const messages_entity_1 = require("../chat/entities/messages.entity");
let ChatController = class ChatController {
    conversationRepo;
    messageRepo;
    constructor(conversationRepo, messageRepo) {
        this.conversationRepo = conversationRepo;
        this.messageRepo = messageRepo;
    }
    async createConversation(customerName) {
        const linkId = (0, uuid_1.v4)();
        const conv = this.conversationRepo.create({
            linkId,
            customerName: customerName || 'Cliente',
        });
        const saved = await this.conversationRepo.save(conv);
        return {
            linkId: saved.linkId,
            url: `https://localhost:3000/chat/${saved.linkId}`,
        };
    }
    async getHistory(linkId) {
        return this.messageRepo.find({
            where: { conversation: { linkId } },
            order: { createdAt: 'ASC' },
            relations: ['conversation'],
        });
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, common_1.Body)('customerName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('history/:linkId'),
    __param(0, (0, common_1.Param)('linkId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getHistory", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __param(0, (0, typeorm_1.InjectRepository)(conversations_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(messages_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChatController);
//# sourceMappingURL=chat.controller.js.map