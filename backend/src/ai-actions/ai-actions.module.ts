import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAction } from './entities/ai-action.entity';
import { AiActionsService } from './ai-actions.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiAction])],
  providers: [AiActionsService],
  exports: [AiActionsService],
})
export class AiActionsModule {}
