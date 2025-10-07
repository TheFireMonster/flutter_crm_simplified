"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsServicesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const products_services_controller_1 = require("./products_services.controller");
const products_services_service_1 = require("./products_services.service");
const products_services_entity_1 = require("./entities/products_services.entity");
let ProductsServicesModule = class ProductsServicesModule {
};
exports.ProductsServicesModule = ProductsServicesModule;
exports.ProductsServicesModule = ProductsServicesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([products_services_entity_1.ProductsServices])],
        controllers: [products_services_controller_1.ProductsServicesController],
        providers: [products_services_service_1.ProductsServicesService],
        exports: [products_services_service_1.ProductsServicesService],
    })
], ProductsServicesModule);
//# sourceMappingURL=products_services.module.js.map