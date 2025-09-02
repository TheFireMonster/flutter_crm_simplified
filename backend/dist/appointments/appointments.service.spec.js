"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const appointments_service_1 = require("./appointments.service");
describe('AppointmentsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [appointments_service_1.AppointmentsService],
        }).compile();
        service = module.get(appointments_service_1.AppointmentsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=appointments.service.spec.js.map