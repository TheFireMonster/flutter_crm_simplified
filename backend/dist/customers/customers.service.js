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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customers_entity_1 = require("./entities/customers.entity");
const common_2 = require("@nestjs/common");
let CustomersService = class CustomersService {
    customersRepository;
    constructor(customersRepository) {
        this.customersRepository = customersRepository;
    }
    create(customerData) {
        const customer = this.customersRepository.create(customerData);
        return this.customersRepository.save(customer);
    }
    findAll() {
        return this.customersRepository.find();
    }
    async findOne(id) {
        const customer = await this.customersRepository.findOneBy({ id });
        if (!customer) {
            throw new common_2.NotFoundException(`Cliente do ID ${id} não encontrado`);
        }
        return customer;
    }
    async update(id, updateData) {
        await this.customersRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        const result = await this.customersRepository.delete({ id });
        if (result.affected === 0) {
            throw new common_2.NotFoundException(`Cliente do ID ${id} não encontrado`);
        }
        return this.customersRepository.delete(id);
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customers_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map