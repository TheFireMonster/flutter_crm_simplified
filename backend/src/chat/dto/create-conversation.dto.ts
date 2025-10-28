import { IsOptional, IsString, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => {
    // Treat empty strings as undefined (omit field) and convert numeric strings to numbers
    if (value === '' || value === null || value === undefined) return undefined;
    const n = Number(value);
    return Number.isNaN(n) ? value : n;
  })
  @Type(() => Number)
  customerId?: number;
}
