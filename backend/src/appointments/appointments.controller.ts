
import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointments.entity';

@Controller('appointments')
export class AppointmentsController {
	constructor(
		@InjectRepository(Appointment)
		private readonly appointmentRepo: Repository<Appointment>,
	) {}

	@Get()
	async getAll() {
		return this.appointmentRepo.find();
	}

	@Post()
	async create(@Body() body: { title: string; description?: string; appointmentDate: string; startTime: string; endTime: string; location?: string }) {
		const appointment = this.appointmentRepo.create({
			title: body.title,
			description: body.description ?? '',
			appointmentDate: new Date(body.appointmentDate),
			startTime: body.startTime,
			endTime: body.endTime,
			location: body.location,
		});
		return this.appointmentRepo.save(appointment);
	}
}
