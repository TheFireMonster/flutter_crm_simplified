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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const conversations_entity_1 = require("./entities/conversations.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const aichat_service_1 = require("../openai/aichat/aichat.service");
let ChatGateway = class ChatGateway {
    chatService;
    conversationRepo;
    aiChatService;
    handleTyping(data, client) {
        this.server.to(data.conversationId).emit('typing', {
            sender: data.sender,
        });
    }
    server;
    constructor(chatService, conversationRepo, aiChatService) {
        this.chatService = chatService;
        this.conversationRepo = conversationRepo;
        this.aiChatService = aiChatService;
    }
    async handleUpdateCustomer(data, client) {
        try {
            const updated = await this.chatService.updateCustomerForConversation(data.conversationId, data.update, client.id);
            this.server.to(data.conversationId).emit('customer_updated', updated);
        }
        catch (err) {
            console.error('handleUpdateCustomer error', err);
        }
    }
    handleConnection(client) {
        console.log('🔗 Socket.IO client connected:', client.id, 'from', client.handshake.address);
    }
    handleDisconnect(client) {
        console.log('❌ Socket.IO client disconnected:', client.id, 'from', client.handshake.address);
    }
    handleJoin(conversationId, client) {
        client.join(conversationId);
        console.log(`Client ${client.id} joined conversation ${conversationId}`);
    }
    async onMessage(data, client) {
        const conversation = await this.conversationRepo.findOne({ where: { linkId: data.conversationId } });
        if (!conversation) {
            console.log('Conversation not found:', data.conversationId);
            return;
        }
        const savedMessage = await this.chatService.saveMessage(conversation.id, data.sender, data.text);
        this.server.to(data.conversationId).emit('receive_message', savedMessage);
        console.error(`onMessage: conversation ${conversation.linkId} AIChatActive=${conversation.AIChatActive}`);
        if (conversation.AIChatActive) {
            console.error('onMessage: AI is active, calling ask (non-streaming)...');
            try {
                this.server.to(data.conversationId).emit('typing', { sender: 'staff' });
            }
            catch (_) { }
            const AIChatReply = await this.aiChatService.ask(data.text, conversation.id, conversation.customerName || undefined);
            try {
                this.server.to(data.conversationId).emit('typing', { sender: 'staff', done: true });
            }
            catch (_) { }
            console.error('onMessage: ask returned, saving bot message');
            const botMessage = await this.chatService.saveMessage(conversation.id, 'AIChat', AIChatReply);
            console.error('onMessage: saved botMessage, emitting to room');
            this.server.to(data.conversationId).emit('receive_message', botMessage);
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('update_customer'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleUpdateCustomer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_conversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onMessage", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __param(1, (0, typeorm_2.InjectRepository)(conversations_entity_1.Conversation)),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        typeorm_1.Repository,
        aichat_service_1.AIChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map