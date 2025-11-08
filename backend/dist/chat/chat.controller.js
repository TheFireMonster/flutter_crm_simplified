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
const crypto_1 = require("crypto");
const conversations_entity_1 = require("../chat/entities/conversations.entity");
const customers_service_1 = require("../customers/customers.service");
const create_conversation_dto_1 = require("./dto/create-conversation.dto");
const update_conversation_dto_1 = require("./dto/update-conversation.dto");
const messages_entity_1 = require("../chat/entities/messages.entity");
let ChatController = class ChatController {
    conversationRepo;
    messageRepo;
    customersService;
    constructor(conversationRepo, messageRepo, customersService) {
        this.conversationRepo = conversationRepo;
        this.messageRepo = messageRepo;
        this.customersService = customersService;
    }
    async updateConversation(linkId, body) {
        const conv = await this.conversationRepo.findOne({ where: { linkId } });
        if (!conv) {
            return { error: 'Conversation not found' };
        }
        if (body.customerName !== undefined) {
            conv.customerName = body.customerName;
        }
        if (body.AIChatActive !== undefined) {
            conv.AIChatActive = body.AIChatActive;
        }
        else if (body.chatGptActive !== undefined) {
            conv.AIChatActive = body.chatGptActive;
        }
        await this.conversationRepo.save(conv);
        return { success: true, customerName: conv.customerName, AIChatActive: conv.AIChatActive };
    }
    async getConversation(linkId) {
        const conv = await this.conversationRepo.findOne({ where: { linkId } });
        if (!conv)
            return { error: 'Conversation not found' };
        return { linkId: conv.linkId, customerName: conv.customerName, chatGptActive: conv.AIChatActive };
    }
    async createConversation(dto) {
        try {
            const linkId = (0, uuid_1.v4)();
            const accessToken = (0, crypto_1.randomBytes)(4).toString('hex');
            const apiBase = process.env.API_BASE_URL || 'http://localhost:3000';
            const customer = await (this.customersService ? this.customersService.findOrCreateCustomer({ id: dto?.customerId, name: dto?.customerName }) : null);
            const conv = this.conversationRepo.create({
                linkId,
                accessToken,
                customerName: dto?.customerName || (customer ? customer.name : 'Cliente'),
            });
            const saved = await this.conversationRepo.save(conv);
            if (customer && customer.id) {
                saved.customerId = customer.id;
                await this.conversationRepo.save(saved);
            }
            return {
                linkId: saved.linkId,
                accessToken: saved.accessToken,
                url: `${apiBase}/chat/${saved.linkId}/${saved.accessToken}`,
                customerId: customer ? customer.id : undefined,
            };
        }
        catch (err) {
            console.error('createConversation error:', err && err.stack ? err.stack : err);
            return { error: 'Failed to create conversation', details: err?.message || String(err) };
        }
    }
    async getHistory(linkId, token) {
        const conv = await this.conversationRepo.findOne({ where: { linkId } });
        if (!conv) {
            return { error: 'Conversa não encontrada. Link inválido.' };
        }
        if (conv.accessToken !== token) {
            return { error: 'Token inválido. Acesso negado.' };
        }
        return this.messageRepo.find({
            where: { conversation: { linkId } },
            order: { createdAt: 'ASC' },
            relations: ['conversation'],
        });
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Patch)('conversations/:linkId'),
    __param(0, (0, common_1.Param)('linkId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_conversation_dto_1.UpdateConversationDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateConversation", null);
__decorate([
    (0, common_1.Get)('conversations/:linkId'),
    __param(0, (0, common_1.Param)('linkId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conversation_dto_1.CreateConversationDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('history/:linkId/:token'),
    __param(0, (0, common_1.Param)('linkId')),
    __param(1, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getHistory", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    __param(0, (0, typeorm_1.InjectRepository)(conversations_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(messages_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        customers_service_1.CustomersService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map