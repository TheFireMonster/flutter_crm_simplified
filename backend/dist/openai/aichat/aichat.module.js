"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIChatModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const aichat_service_1 = require("./aichat.service");
const config_1 = require("@nestjs/config");
const appointments_module_1 = require("../../appointments/appointments.module");
const service_module_1 = require("../../services/service.module");
const customers_module_1 = require("../../customers/customers.module");
const chat_module_1 = require("../../chat/chat.module");
let AIChatModule = class AIChatModule {
};
exports.AIChatModule = AIChatModule;
exports.AIChatModule = AIChatModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule, config_1.ConfigModule, appointments_module_1.AppointmentsModule, service_module_1.ServiceModule, customers_module_1.CustomersModule, (0, common_1.forwardRef)(() => chat_module_1.ChatModule)],
        providers: [aichat_service_1.AIChatService],
        exports: [aichat_service_1.AIChatService],
    })
], AIChatModule);
//# sourceMappingURL=aichat.module.js.map