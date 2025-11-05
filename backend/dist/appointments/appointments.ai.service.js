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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsAiService = void 0;
const common_1 = require("@nestjs/common");
const ai_actions_service_1 = require("../ai-actions/ai-actions.service");
const appointments_service_1 = require("./appointments.service");
const customers_service_1 = require("../customers/customers.service");
let AppointmentsAiService = class AppointmentsAiService {
    aiActionsService;
    appointmentsService;
    customersService;
    constructor(aiActionsService, appointmentsService, customersService) {
        this.aiActionsService = aiActionsService;
        this.appointmentsService = appointmentsService;
        this.customersService = customersService;
    }
    async createDraftFromAi(dto) {
        const requestId = dto.requestId || `ai-${Date.now()}`;
        const { inserted, record } = await this.aiActionsService.reserve(requestId, 'create_appointment', dto);
        if (!inserted) {
            if (record?.resultTable === 'appointments' && record?.resultId) {
                const existing = await this.appointmentsService.getAll();
                return existing.find(a => a.id === record.resultId) || record;
            }
            return record;
        }
        const title = dto.serviceName || 'Appointment';
        const description = dto.notes || '';
        const pad = (n) => n.toString().padStart(2, '0');
        const toLocalTimeString = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
        let start = new Date(dto.startAt);
        const duration = (dto.durationMinutes && dto.durationMinutes > 0) ? dto.durationMinutes : 60;
        let startTime = toLocalTimeString(start);
        let endTime = toLocalTimeString(new Date(start.getTime() + duration * 60000));
        const appointmentDate = dto.startAt.split('T')[0];
        const maxAttempts = 24;
        let attempts = 0;
        try {
            while (await this.appointmentsService.hasOverlap(appointmentDate, startTime, endTime) && attempts < maxAttempts) {
                start = new Date(start.getTime() + duration * 60000);
                startTime = toLocalTimeString(start);
                endTime = toLocalTimeString(new Date(start.getTime() + duration * 60000));
                attempts++;
            }
        }
        catch (e) {
            console.error('Error checking appointment overlap, proceeding with original time', e);
        }
        const created = await this.appointmentsService.create({
            title,
            description,
            appointmentDate,
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            location: undefined,
            customerId: dto.customerId,
        });
        const createdEntity = Array.isArray(created) ? created[0] : created;
        const createdId = createdEntity ? createdEntity.id : null;
        if (createdId) {
            await this.aiActionsService.finalize(requestId, 'appointments', createdId);
        }
        return createdEntity || created;
    }
};
exports.AppointmentsAiService = AppointmentsAiService;
exports.AppointmentsAiService = AppointmentsAiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_actions_service_1.AiActionsService,
        appointments_service_1.AppointmentsService,
        customers_service_1.CustomersService])
], AppointmentsAiService);
//# sourceMappingURL=appointments.ai.service.js.map