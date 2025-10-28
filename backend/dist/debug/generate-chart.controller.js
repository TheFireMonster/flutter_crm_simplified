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
exports.GenerateChartController = void 0;
const common_1 = require("@nestjs/common");
let GenerateChartController = class GenerateChartController {
    generate(body) {
        const now = new Date();
        const labels = [
            new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
            now.toISOString().slice(0, 10),
        ];
        const series = [[5, 7, 3]];
        return { ok: true, labels, series, received: body };
    }
};
exports.GenerateChartController = GenerateChartController;
__decorate([
    (0, common_1.Post)('generate_chart'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GenerateChartController.prototype, "generate", null);
exports.GenerateChartController = GenerateChartController = __decorate([
    (0, common_1.Controller)()
], GenerateChartController);
//# sourceMappingURL=generate-chart.controller.js.map