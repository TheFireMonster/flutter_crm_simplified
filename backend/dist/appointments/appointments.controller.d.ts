import { Repository } from 'typeorm';
import { Appointment } from './entities/appointments.entity';
export declare class AppointmentsController {
    private readonly appointmentRepo;
    constructor(appointmentRepo: Repository<Appointment>);
    getAll(): Promise<Appointment[]>;
    create(body: {
        title: string;
        description?: string;
        appointmentDate: string;
        startTime: string;
        endTime: string;
        location?: string;
    }): Promise<Appointment>;
}
