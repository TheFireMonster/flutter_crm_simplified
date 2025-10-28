import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsBoolean()
  AIChatActive?: boolean;

  @IsOptional()
  @IsBoolean()
  chatGptActive?: boolean;
}
