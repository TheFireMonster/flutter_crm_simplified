import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAction } from './entities/ai-action.entity';

@Injectable()
export class AiActionsService {
  constructor(
    @InjectRepository(AiAction)
    private readonly aiActionsRepo: Repository<AiAction>,
  ) {}

  async reserve(requestId: string, actionType: string, payload: any) {
    // Tenta inserir uma nova ai_action. Se requestId já existir, retorna a linha existente.
    try {
      const entity = this.aiActionsRepo.create({ requestId, actionType, payload });
      const saved = await this.aiActionsRepo.save(entity);
      return { inserted: true, record: saved };
    } catch (err) {
      // Assumindo que a restrição única é sobre requestId -> encontrar existente
      const existing = await this.aiActionsRepo.findOne({ where: { requestId } });
      return { inserted: false, record: existing };
    }
  }

  async finalize(requestId: string, resultTable: string, resultId: number) {
    const existing = await this.aiActionsRepo.findOne({ where: { requestId } });
    if (!existing) return null;
    existing.resultTable = resultTable;
    existing.resultId = resultId;
    return this.aiActionsRepo.save(existing);
  }

  async findByRequestId(requestId: string) {
    return this.aiActionsRepo.findOne({ where: { requestId } });
  }
}
