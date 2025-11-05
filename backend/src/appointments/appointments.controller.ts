
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
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

	@Get(':id')
	async findOne(@Param('id') id: string) {
		return this.appointmentsService.findOne(Number(id));
	}

	@Post()
	async create(@Body() body: CreateAppointmentDto) {
			const dt = new Date(body.appointmentDate);
			if (isNaN(dt.getTime())) {
				return { error: 'Invalid appointmentDate' };
			}
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

			const start = new Date(dt);
			const end = new Date(dt.getTime() + durationMin * 60 * 1000);

			const pad = (n: number) => n.toString().padStart(2, '0');
			const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}:00`;
			const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}:00`;

			const dateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());

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

	@Put(':id')
	async update(@Param('id') id: string, @Body() body: Partial<CreateAppointmentDto>) {
		const updateData: any = {};
		
		if (body.title !== undefined) updateData.title = body.title;
		if (body.description !== undefined) updateData.description = body.description;
		if (body.location !== undefined) updateData.location = body.location;
		if (body.customerId !== undefined) updateData.customerId = body.customerId;
		if (body.customerName !== undefined) updateData.customerName = body.customerName;
		
		if (body.appointmentDate) {
			const dt = new Date(body.appointmentDate);
			if (!isNaN(dt.getTime())) {
				const dateOnly = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
				updateData.appointmentDate = dateOnly;
				
				if (body.duration) {
					const start = new Date(dt);
					const end = new Date(dt.getTime() + body.duration * 60 * 1000);
					const pad = (n: number) => n.toString().padStart(2, '0');
					updateData.startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}:00`;
					updateData.endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}:00`;
					updateData.duration = body.duration;
				}
			}
		}

		return this.appointmentsService.update(Number(id), updateData);
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		return this.appointmentsService.remove(Number(id));
	}
}
