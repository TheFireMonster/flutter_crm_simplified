import { IsOptional, IsString } from 'class-validator';

export class FirebaseRegisterDto {
  @IsOptional()
  @IsString()
  name?: string;
}
