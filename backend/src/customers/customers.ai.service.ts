import { Injectable } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerFromAiDto } from './dto/create-customer-from-ai.dto';
import { AiActionsService } from '../ai-actions/ai-actions.service';

@Injectable()
export class CustomersAiService {
  constructor(
    private customersService: CustomersService,
    private aiActionsService: AiActionsService,
  ) {}

  async createDraftFromAi(dto: CreateCustomerFromAiDto) {
    const requestId = dto.requestId || `ai-${Date.now()}`;
    const { inserted, record } = await this.aiActionsService.reserve(requestId, 'create_customer', dto);

    if (!inserted) {
      if (record?.resultTable === 'customers' && record?.resultId) {
        return this.customersService.findOne(record.resultId);
      }
      return record;
    }

    const created = await this.customersService.create({
      name: dto.name,
      email: dto.email,
      cpf: dto.cpf?.replace(/\D/g, ''),
      phone: dto.phone,
      address: dto.address,
      source: dto.source,
    });

    await this.aiActionsService.finalize(requestId, 'customers', created.id);
    return created;
  }
}
