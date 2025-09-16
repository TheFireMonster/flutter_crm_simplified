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
let ChatGateway = class ChatGateway {
    chatService;
    conversationRepo;
    server;
    constructor(chatService, conversationRepo) {
        this.chatService = chatService;
        this.conversationRepo = conversationRepo;
    }
    handleConnection(client) {
        console.log('Client connected:', client.id);
    }
    handleDisconnect(client) {
        console.log('Client disconnected:', client.id);
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
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
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
        typeorm_1.Repository])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map