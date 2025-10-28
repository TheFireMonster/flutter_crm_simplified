"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugModule = void 0;
const common_1 = require("@nestjs/common");
const debug_controller_1 = require("./debug.controller");
const generate_chart_controller_1 = require("./generate-chart.controller");
const customers_module_1 = require("../customers/customers.module");
const appointments_module_1 = require("../appointments/appointments.module");
const ai_actions_module_1 = require("../ai-actions/ai-actions.module");
let DebugModule = class DebugModule {
};
exports.DebugModule = DebugModule;
exports.DebugModule = DebugModule = __decorate([
    (0, common_1.Module)({
        imports: [customers_module_1.CustomersModule, appointments_module_1.AppointmentsModule, ai_actions_module_1.AiActionsModule],
        controllers: [debug_controller_1.DebugController, generate_chart_controller_1.GenerateChartController],
    })
], DebugModule);
//# sourceMappingURL=debug.module.js.map