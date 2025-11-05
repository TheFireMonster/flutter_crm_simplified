import { Injectable, NotFoundException } from '@nestjs/common';
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

	async findOne(id: number): Promise<Appointment> {
		const appointment = await this.appointmentRepo.findOneBy({ id });
		if (!appointment) {
			throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
		}
		return appointment;
	}

	async hasOverlap(date: string, startTime: string, endTime: string, excludeId?: number) {
		const qb = this.appointmentRepo.createQueryBuilder('a')
			.where('a.appointmentDate = :date', { date })
			.andWhere('NOT (a.endTime <= :start OR a.startTime >= :end)', { start: startTime, end: endTime });
		
		if (excludeId) {
			qb.andWhere('a.id != :excludeId', { excludeId });
		}
		
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

	async update(id: number, data: Partial<{ title: string; description?: string; appointmentDate: string; startTime?: string; endTime?: string; duration?: number; location?: string; customerId?: number; customerName?: string }>): Promise<Appointment> {
		await this.appointmentRepo.update(id, <any>data);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		const result = await this.appointmentRepo.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Agendamento com ID ${id} não encontrado`);
		}
	}
}
