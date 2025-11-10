import { IsOptional, IsString, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const n = Number(value);
    return Number.isNaN(n) ? value : n;
  })
  @Type(() => Number)
  customerId?: number;
}
