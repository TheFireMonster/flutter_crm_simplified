

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
		return this.saleRepository.save(sale);
	}

	async findAll(): Promise<Sale[]> {
		return this.saleRepository.find();
	}
}

