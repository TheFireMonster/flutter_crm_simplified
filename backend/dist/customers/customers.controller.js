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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
let CustomersController = class CustomersController {
    create() {
        return 'This action adds a new customer';
    }
    findAll() {
        return 'This action returns all customers';
    }
    findOne() {
        return 'This action returns a single customer';
    }
    update() {
        return 'This action updates a customer';
    }
    search() {
        return 'This action searches for customers';
    }
    export() {
        return 'This action exports customers data';
    }
    remove() {
        return 'This action removes a customer';
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Post)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('search'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('export'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "export", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "remove", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)('customers')
], CustomersController);
//# sourceMappingURL=customers.controller.js.map