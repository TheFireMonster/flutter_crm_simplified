import { Controller, Delete, Get, Post, Put, Param } from '@nestjs/common';

@Controller('customers')
export class CustomersController {
    @Post()
    create() {
        return 'This action adds a new customer';
    }

    @Get()
    findAll() {
        return 'This action returns all customers';
    }
    
    @Get('search')
    search() {
        return 'This action searches for customers';
    }  
    
    @Get('export')
    export() {
        return 'This action exports customers data';
    }
    
    @Get(':id')
    findOne(@Param('id') id: string) {
        return `This action returns customer ${id}`;
    }
    
    @Put(':id')
    update(@Param('id') id: string) {
        return `This action updates customer ${id}`;
    }
    
    @Delete(':id')
    remove(@Param('id') id: string) {
        return `This action removes customer ${id}`;
    }
}