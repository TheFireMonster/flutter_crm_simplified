

import { Injectable } from '@nestjs/common';
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
		// return with customer relation loaded so clients receive nested customer
		const found = await this.saleRepository.findOne({ where: { id: saved.id }, relations: ['customer'] });
		return found as Sale;
	}

	async findAll(): Promise<Sale[]> {
		return this.saleRepository.find({ relations: ['customer'] });
	}
}

