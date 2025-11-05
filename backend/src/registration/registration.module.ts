import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationService } from './registration.service';
import { RegistrationCode } from './entities/registration-code.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegistrationCode])],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}