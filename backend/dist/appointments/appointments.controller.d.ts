import { Repository } from 'typeorm';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointments.entity';
export declare class AppointmentsController {
    private readonly appointmentRepo;
    private readonly appointmentsService;
    constructor(appointmentRepo: Repository<Appointment>, appointmentsService: AppointmentsService);
    getAll(): Promise<Appointment[]>;
    create(body: CreateAppointmentDto): Promise<Appointment | {
        error: string;
    }>;
}
