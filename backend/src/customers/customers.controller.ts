import { Controller, Delete, Get, Post, Put, Param, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customers.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Post()
    create(@Body() body: CreateCustomerDto) {
        const sanitized = { ...body } as any;
        if (sanitized.cpf) {
            sanitized.cpf = sanitized.cpf.replace(/\D/g, '');
        }
        return this.customersService.create(sanitized);
    }

    @Get()
    findAll() {
        return this.customersService.findAll();
    }
    
    @Get('search')
    search() {
        return this.customersService.findAll();
    }  
    
    @Get('export')
    export() {
        return this.customersService.findAll();
    }
    
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(Number(id));
    }
    
    @Put(':id')
    update(@Param('id') id: string, @Body() body: CreateCustomerDto) {
        const sanitized = { ...body } as any;
        if (sanitized.cpf) {
            sanitized.cpf = sanitized.cpf.replace(/\D/g, '');
        }
        return this.customersService.update(Number(id), sanitized);
    }
    
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.customersService.remove(Number(id));
    }
}
