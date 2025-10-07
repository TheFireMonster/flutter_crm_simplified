"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGptModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const chatgpt_service_1 = require("./chatgpt.service");
const config_1 = require("@nestjs/config");
const products_services_module_1 = require("../products_services/products_services.module");
const appointments_module_1 = require("../appointments/appointments.module");
let ChatGptModule = class ChatGptModule {
};
exports.ChatGptModule = ChatGptModule;
exports.ChatGptModule = ChatGptModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule, config_1.ConfigModule, products_services_module_1.ProductsServicesModule, appointments_module_1.AppointmentsModule],
        providers: [chatgpt_service_1.ChatGptService],
        exports: [chatgpt_service_1.ChatGptService],
    })
], ChatGptModule);
//# sourceMappingURL=chatgpt.module.js.map