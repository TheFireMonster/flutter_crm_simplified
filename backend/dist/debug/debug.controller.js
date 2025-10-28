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
exports.DebugController = void 0;
const common_1 = require("@nestjs/common");
const customers_ai_service_1 = require("../customers/customers.ai.service");
const appointments_ai_service_1 = require("../appointments/appointments.ai.service");
const ai_actions_service_1 = require("../ai-actions/ai-actions.service");
let DebugController = class DebugController {
    customersAi;
    appointmentsAi;
    aiActionsService;
    constructor(customersAi, appointmentsAi, aiActionsService) {
        this.customersAi = customersAi;
        this.appointmentsAi = appointmentsAi;
        this.aiActionsService = aiActionsService;
    }
    async aiAction(body) {
        if (body.type === 'customer') {
            return this.customersAi.createDraftFromAi(body.payload);
        }
        return this.appointmentsAi.createDraftFromAi(body.payload);
    }
    async getAiAction(requestId) {
        return this.aiActionsService.findByRequestId(requestId);
    }
};
exports.DebugController = DebugController;
__decorate([
    (0, common_1.Post)('ai-action'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DebugController.prototype, "aiAction", null);
__decorate([
    (0, common_1.Get)('ai-action/:requestId'),
    __param(0, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DebugController.prototype, "getAiAction", null);
exports.DebugController = DebugController = __decorate([
    (0, common_1.Controller)('debug'),
    __metadata("design:paramtypes", [customers_ai_service_1.CustomersAiService,
        appointments_ai_service_1.AppointmentsAiService,
        ai_actions_service_1.AiActionsService])
], DebugController);
//# sourceMappingURL=debug.controller.js.map