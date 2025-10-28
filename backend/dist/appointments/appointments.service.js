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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointments_entity_1 = require("./entities/appointments.entity");
let AppointmentsService = class AppointmentsService {
    appointmentRepo;
    constructor(appointmentRepo) {
        this.appointmentRepo = appointmentRepo;
    }
    async getAll() {
        return this.appointmentRepo.find();
    }
    async hasOverlap(date, startTime, endTime) {
        const qb = this.appointmentRepo.createQueryBuilder('a')
            .where('a.appointmentDate = :date', { date })
            .andWhere('NOT (a.endTime <= :start OR a.startTime >= :end)', { start: startTime, end: endTime });
        const found = await qb.getOne();
        return !!found;
    }
    async create(data) {
        const appointment = this.appointmentRepo.create({
            title: data.title,
            description: data.description ?? '',
            appointmentDate: new Date(data.appointmentDate),
            startTime: data.startTime ?? null,
            endTime: data.endTime ?? null,
            duration: data.duration ?? null,
            location: data.location,
            customerId: data.customerId ?? null,
            customerName: data.customerName ?? null,
        });
        return this.appointmentRepo.save(appointment);
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointments_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map