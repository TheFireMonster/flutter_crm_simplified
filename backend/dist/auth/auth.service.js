"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_entity_1 = require("../users/entities/users.entity");
const crypto = __importStar(require("crypto"));
const admin = __importStar(require("firebase-admin"));
let AuthService = class AuthService {
    userRepo;
    jwtService;
    constructor(userRepo, jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }
    async firebaseRegister(idToken, name) {
        let decoded;
        try {
            decoded = await admin.auth().verifyIdToken(idToken);
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid Firebase token');
        }
        let user = await this.userRepo.findOne({
            where: { email: decoded.email },
        });
        if (!user) {
            user = this.userRepo.create({
                email: decoded.email,
                name: name || decoded.name || '',
                refreshToken: crypto.randomBytes(32).toString('hex'),
            });
            await this.userRepo.save(user);
        }
        return this.createToken(user);
    }
    async firebaseLogin(idToken) {
        let decoded;
        try {
            decoded = await admin.auth().verifyIdToken(idToken);
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid Firebase token');
        }
        let user = await this.userRepo.findOne({
            where: { email: decoded.email },
        });
        if (!user) {
            user = this.userRepo.create({
                email: decoded.email,
                name: decoded.name || '',
                refreshToken: crypto.randomBytes(32).toString('hex'),
            });
            await this.userRepo.save(user);
        }
        return this.createToken(user);
    }
    async refreshToken(refreshToken) {
        const user = await this.userRepo.findOne({
            where: { refreshToken },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const newRefreshToken = crypto.randomBytes(32).toString('hex');
        user.refreshToken = newRefreshToken;
        await this.userRepo.save(user);
        return this.createToken(user);
    }
    createToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
        };
        return {
            token: this.jwtService.sign(payload),
            expiry: Date.now() + 3600 * 1000,
            refresh_token: user.refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(users_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map