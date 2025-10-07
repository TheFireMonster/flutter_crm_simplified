import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSaleDto {
  @IsString()
  productName: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;
}
