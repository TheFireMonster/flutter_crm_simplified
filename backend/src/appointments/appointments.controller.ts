
import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './entities/appointments.entity';

@Controller('appointments')
export class AppointmentsController {
	constructor(
		@InjectRepository(Appointment)
		private readonly appointmentRepo: Repository<Appointment>,
		private readonly appointmentsService: AppointmentsService,
	) { }

	@Get()
	async getAll() {
		return this.appointmentRepo.find();
	}

	@Post()
	async create(@Body() body: CreateAppointmentDto) {
			// parse appointmentDate (may come as an ISO string with time)
			const dt = new Date(body.appointmentDate);
			if (isNaN(dt.getTime())) {
				return { error: 'Invalid appointmentDate' };
			}
				// prefer explicit duration in body, fallback to parsing description, then 60 minutes
				let durationMin = body.duration ?? 0;
				if (!durationMin) {
					try {
						const desc = (body.description ?? '').toString();
						const m = desc.match(/(\d+)/);
						if (m) durationMin = parseInt(m[1], 10) || 60;
					} catch (e) {
						durationMin = 60;
					}
				}
				if (!durationMin) durationMin = 60;

			// compute start and end times as HH:MM:SS strings
			const start = new Date(dt);
			const end = new Date(dt.getTime() + durationMin * 60 * 1000);

			const pad = (n: number) => n.toString().padStart(2, '0');
			const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}:00`;
			const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}:00`;

			// normalize date (store only date portion in appointmentDate column)
			const dateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());

				// check overlap using service helper
				const dateKey = dateOnly.toISOString().substring(0, 10);
				const conflict = await this.appointmentsService.hasOverlap(dateKey, startTime, endTime);
				if (conflict) {
					return { error: 'Time slot already booked or overlaps existing appointment. Please choose another time.' };
				}

				const appointment = this.appointmentRepo.create({
				title: body.title,
				description: body.description ?? '',
				appointmentDate: dateOnly,
				startTime: startTime,
				endTime: endTime,
					duration: durationMin,
				location: body.location,
				customerId: body.customerId,
				customerName: body.customerName,
			});
			return this.appointmentRepo.save(appointment);
	}
}
