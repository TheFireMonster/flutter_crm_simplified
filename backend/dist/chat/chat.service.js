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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const messages_entity_1 = require("./entities/messages.entity");
const conversations_entity_1 = require("./entities/conversations.entity");
const customers_service_1 = require("../customers/customers.service");
const customer_audit_entity_1 = require("../customers/entities/customer-audit.entity");
let ChatService = class ChatService {
    messageRepo;
    conversationRepo;
    customersService;
    auditRepo;
    constructor(messageRepo, conversationRepo, customersService, auditRepo) {
        this.messageRepo = messageRepo;
        this.conversationRepo = conversationRepo;
        this.customersService = customersService;
        this.auditRepo = auditRepo;
    }
    async saveMessage(conversationId, sender, text) {
        const msg = this.messageRepo.create({
            conversation: { id: conversationId },
            sender,
            content: text,
        });
        return this.messageRepo.save(msg);
    }
    async getRecentMessages(conversationId, limit = 20) {
        return this.messageRepo.createQueryBuilder('m')
            .leftJoinAndSelect('m.conversation', 'c')
            .where('c.id = :id', { id: conversationId })
            .orderBy('m.createdAt', 'ASC')
            .take(limit)
            .getMany();
    }
    async updateCustomerForConversation(conversationLinkId, updateData, changedBy) {
        const conv = await this.conversationRepo.findOne({ where: { linkId: conversationLinkId } });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        if (conv.customerId) {
            const before = await this.customersService.findOne(conv.customerId);
            const updated = await this.customersService.update(conv.customerId, updateData);
            const changes = {};
            for (const k of Object.keys(updateData)) {
                const prev = before[k];
                const next = updated[k];
                if (JSON.stringify(prev) !== JSON.stringify(next)) {
                    changes[k] = { before: prev, after: next };
                }
            }
            if (Object.keys(changes).length > 0) {
                await this.auditRepo.save({
                    customerId: conv.customerId,
                    conversationLinkId: conversationLinkId,
                    changedBy: changedBy || 'chat',
                    changes,
                });
            }
            return updated;
        }
        const created = await this.customersService.create({ ...updateData });
        conv.customerId = created.id;
        await this.conversationRepo.save(conv);
        await this.auditRepo.save({
            customerId: created.id,
            conversationLinkId: conversationLinkId,
            changedBy: changedBy || 'chat',
            changes: { created: updateData },
        });
        return created;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(messages_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(conversations_entity_1.Conversation)),
    __param(3, (0, typeorm_1.InjectRepository)(customer_audit_entity_1.CustomerAudit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        customers_service_1.CustomersService,
        typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map