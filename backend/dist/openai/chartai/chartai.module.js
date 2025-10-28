"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartAIModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const chartai_service_1 = require("./chartai.service");
const chartai_controller_1 = require("./chartai.controller");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const appointments_entity_1 = require("../../appointments/entities/appointments.entity");
const customers_entity_1 = require("../../customers/entities/customers.entity");
const service_entity_1 = require("../../services/entities/service.entity");
let ChartAIModule = class ChartAIModule {
};
exports.ChartAIModule = ChartAIModule;
exports.ChartAIModule = ChartAIModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule, config_1.ConfigModule, typeorm_1.TypeOrmModule.forFeature([appointments_entity_1.Appointment, customers_entity_1.Customer, service_entity_1.Service])],
        providers: [chartai_service_1.ChartAIService],
        controllers: [chartai_controller_1.ChartAIController],
        exports: [chartai_service_1.ChartAIService],
    })
], ChartAIModule);
//# sourceMappingURL=chartai.module.js.map