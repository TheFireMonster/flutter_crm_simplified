import { IsString, IsNumber, IsOptional } from 'class-validator';

// DTO keys must match the entity columns so TypeORM.create() maps fields correctly.
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
