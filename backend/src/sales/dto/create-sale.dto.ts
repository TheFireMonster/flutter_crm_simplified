import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSaleDto {
  @IsString()
  serviceName: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsNumber()
  customerId?: number;
}
