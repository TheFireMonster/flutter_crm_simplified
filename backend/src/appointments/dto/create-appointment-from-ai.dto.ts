import { IsISO8601, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateAppointmentFromAiDto {
  @IsInt()
  customerId: number;

  @IsOptional()
  @IsInt()
  serviceId?: number;

  @IsOptional()
  @IsString()
  serviceName?: string;

  @IsISO8601()
  startAt: string; // ISO-8601

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  requestId?: string; // idempotency key from AI
}
