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
exports.AppointmentsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointments_service_1 = require("./appointments.service");
const create_appointment_dto_1 = require("./dto/create-appointment.dto");
const appointments_entity_1 = require("./entities/appointments.entity");
let AppointmentsController = class AppointmentsController {
    appointmentRepo;
    appointmentsService;
    constructor(appointmentRepo, appointmentsService) {
        this.appointmentRepo = appointmentRepo;
        this.appointmentsService = appointmentsService;
    }
    async getAll() {
        return this.appointmentRepo.find();
    }
    async findOne(id) {
        return this.appointmentsService.findOne(Number(id));
    }
    async create(body) {
        const dt = new Date(body.appointmentDate);
        if (isNaN(dt.getTime())) {
            return { error: 'Invalid appointmentDate' };
        }
        let durationMin = body.duration ?? 0;
        if (!durationMin) {
            try {
                const desc = (body.description ?? '').toString();
                const m = desc.match(/(\d+)/);
                if (m)
                    durationMin = parseInt(m[1], 10) || 60;
            }
            catch (e) {
                durationMin = 60;
            }
        }
        if (!durationMin)
            durationMin = 60;
        const start = new Date(dt);
        const end = new Date(dt.getTime() + durationMin * 60 * 1000);
        const pad = (n) => n.toString().padStart(2, '0');
        const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}:00`;
        const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}:00`;
        const dateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const dateKey = dateOnly.toISOString().substring(0, 10);
        const conflict = await this.appointmentsService.hasOverlap(dateKey, startTime, endTime);
        if (conflict) {
            return { error: 'Time slot already booked or overlaps existing appointment. Please choose another time.' };
        }
        const appointment = this.appointmentRepo.create({
            title: body.title,
            description: body.description ?? '',
            appointmentDate: dateOnly,
            startTime: startTime,
            endTime: endTime,
            duration: durationMin,
            location: body.location,
            customerId: body.customerId,
            customerName: body.customerName,
        });
        return this.appointmentRepo.save(appointment);
    }
    async update(id, body) {
        const updateData = {};
        if (body.title !== undefined)
            updateData.title = body.title;
        if (body.description !== undefined)
            updateData.description = body.description;
        if (body.location !== undefined)
            updateData.location = body.location;
        if (body.customerId !== undefined)
            updateData.customerId = body.customerId;
        if (body.customerName !== undefined)
            updateData.customerName = body.customerName;
        if (body.appointmentDate) {
            const dt = new Date(body.appointmentDate);
            if (!isNaN(dt.getTime())) {
                const dateOnly = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
                updateData.appointmentDate = dateOnly;
                if (body.duration) {
                    const start = new Date(dt);
                    const end = new Date(dt.getTime() + body.duration * 60 * 1000);
                    const pad = (n) => n.toString().padStart(2, '0');
                    updateData.startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}:00`;
                    updateData.endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}:00`;
                    updateData.duration = body.duration;
                }
            }
        }
        return this.appointmentsService.update(Number(id), updateData);
    }
    async remove(id) {
        return this.appointmentsService.remove(Number(id));
    }
};
exports.AppointmentsController = AppointmentsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_appointment_dto_1.CreateAppointmentDto]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppointmentsController.prototype, "remove", null);
exports.AppointmentsController = AppointmentsController = __decorate([
    (0, common_1.Controller)('appointments'),
    __param(0, (0, typeorm_1.InjectRepository)(appointments_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        appointments_service_1.AppointmentsService])
], AppointmentsController);
//# sourceMappingURL=appointments.controller.js.map