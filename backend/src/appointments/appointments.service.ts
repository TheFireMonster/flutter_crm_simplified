import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointments.entity';

@Injectable()
export class AppointmentsService {
	constructor(
		@InjectRepository(Appointment)
		private readonly appointmentRepo: Repository<Appointment>,
	) {}

	async getAll() {
		return this.appointmentRepo.find();
	}

	async create(data: { title: string; description?: string; appointmentDate: string; location?: string }) {
		const appointment = this.appointmentRepo.create({
			title: data.title,
			description: data.description ?? '',
			appointmentDate: new Date(data.appointmentDate),
			location: data.location,
		});
		return this.appointmentRepo.save(appointment);
	}
}
