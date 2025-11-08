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
exports.RegistrationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const registration_code_entity_1 = require("./entities/registration-code.entity");
const crypto_1 = require("crypto");
let RegistrationService = class RegistrationService {
    registrationCodeRepository;
    constructor(registrationCodeRepository) {
        this.registrationCodeRepository = registrationCodeRepository;
    }
    async generateRegistrationCode() {
        const code = (0, crypto_1.randomBytes)(16).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        const registrationCode = this.registrationCodeRepository.create({
            code,
            expiresAt,
        });
        await this.registrationCodeRepository.save(registrationCode);
        return code;
    }
    async validateRegistrationCode(code) {
        const registrationCode = await this.registrationCodeRepository.findOne({
            where: {
                code,
                used: false,
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
        });
        if (!registrationCode) {
            throw new common_1.NotFoundException('Código de registro inválido ou expirado');
        }
        return registrationCode;
    }
    async markCodeAsUsed(code, email) {
        await this.registrationCodeRepository.update({ code }, {
            used: true,
            usedAt: new Date(),
            usedByEmail: email,
        });
    }
};
exports.RegistrationService = RegistrationService;
exports.RegistrationService = RegistrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(registration_code_entity_1.RegistrationCode)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RegistrationService);
//# sourceMappingURL=registration.service.js.map