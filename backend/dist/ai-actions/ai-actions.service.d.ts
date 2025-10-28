import { Repository } from 'typeorm';
import { AiAction } from './entities/ai-action.entity';
export declare class AiActionsService {
    private readonly aiActionsRepo;
    constructor(aiActionsRepo: Repository<AiAction>);
    reserve(requestId: string, actionType: string, payload: any): Promise<{
        inserted: boolean;
        record: AiAction | null;
    }>;
    finalize(requestId: string, resultTable: string, resultId: number): Promise<AiAction | null>;
    findByRequestId(requestId: string): Promise<AiAction | null>;
}
