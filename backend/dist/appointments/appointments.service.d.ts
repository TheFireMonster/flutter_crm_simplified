import { Repository } from 'typeorm';
import { Appointment } from './entities/appointments.entity';
export declare class AppointmentsService {
    private readonly appointmentRepo;
    constructor(appointmentRepo: Repository<Appointment>);
    getAll(): Promise<Appointment[]>;
    findOne(id: number): Promise<Appointment>;
    hasOverlap(date: string, startTime: string, endTime: string, excludeId?: number): Promise<boolean>;
    create(data: {
        title: string;
        description?: string;
        appointmentDate: string;
        startTime?: string;
        endTime?: string;
        duration?: number;
        location?: string;
        customerId?: number;
        customerName?: string;
    }): Promise<Appointment[]>;
    update(id: number, data: Partial<{
        title: string;
        description?: string;
        appointmentDate: string;
        startTime?: string;
        endTime?: string;
        duration?: number;
        location?: string;
        customerId?: number;
        customerName?: string;
    }>): Promise<Appointment>;
    remove(id: number): Promise<void>;
}
