import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductsServicesDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  type: string; // 'product' or 'service'
}
