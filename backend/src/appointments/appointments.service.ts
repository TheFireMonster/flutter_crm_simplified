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

	async hasOverlap(date: string, startTime: string, endTime: string) {
		const qb = this.appointmentRepo.createQueryBuilder('a')
			.where('a.appointmentDate = :date', { date })
			.andWhere('NOT (a.endTime <= :start OR a.startTime >= :end)', { start: startTime, end: endTime });
		const found = await qb.getOne();
		return !!found;
	}

	async create(data: { title: string; description?: string; appointmentDate: string; startTime?: string; endTime?: string; duration?: number; location?: string; customerId?: number; customerName?: string }) {
		const appointment = this.appointmentRepo.create(<any>{
			title: data.title,
			description: data.description ?? '',
			appointmentDate: new Date(data.appointmentDate),
			startTime: data.startTime ?? null,
			endTime: data.endTime ?? null,
			duration: data.duration ?? null,
			location: data.location,
			customerId: data.customerId ?? null,
			customerName: data.customerName ?? null,
		});
		return this.appointmentRepo.save(appointment);
	}
}
