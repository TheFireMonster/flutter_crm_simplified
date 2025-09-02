"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const appointments_controller_1 = require("./appointments.controller");
describe('AppointmentsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [appointments_controller_1.AppointmentsController],
        }).compile();
        controller = module.get(appointments_controller_1.AppointmentsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=appointments.controller.spec.js.map