

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sales.entity';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
	constructor(
		@InjectRepository(Sale)
		private readonly saleRepository: Repository<Sale>,
	) {}

	async create(createSaleDto: CreateSaleDto): Promise<Sale> {
		const sale = this.saleRepository.create(createSaleDto);
		const saved = await this.saleRepository.save(sale);
		const found = await this.saleRepository.findOne({ where: { id: saved.id }, relations: ['customer'] });
		return found as Sale;
	}

	async findAll(): Promise<Sale[]> {
		return this.saleRepository.find({ relations: ['customer'] });
	}

	async findOne(id: number): Promise<Sale> {
		const sale = await this.saleRepository.findOne({ where: { id }, relations: ['customer'] });
		if (!sale) {
			throw new NotFoundException(`Venda com ID ${id} não encontrada`);
		}
		return sale;
	}

	async update(id: number, updateDto: Partial<CreateSaleDto>): Promise<Sale> {
		await this.saleRepository.update(id, updateDto);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		const result = await this.saleRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Venda com ID ${id} não encontrada`);
		}
	}
}

