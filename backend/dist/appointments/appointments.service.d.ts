import { Repository } from 'typeorm';
import { Appointment } from './entities/appointments.entity';
export declare class AppointmentsService {
    private readonly appointmentRepo;
    constructor(appointmentRepo: Repository<Appointment>);
    getAll(): Promise<Appointment[]>;
    create(data: {
        title: string;
        description?: string;
        appointmentDate: string;
        location?: string;
    }): Promise<Appointment>;
}
