import { Controller, Delete, Get, Post, Put } from '@nestjs/common';

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
    @Get(':id')
    findOne() {
        return 'This action returns a single customer';
    }
    @Put(':id')
    update() {
        return 'This action updates a customer';
    }
    @Get('search')
    search() {
        return 'This action searches for customers';
    }  
    @Get('export')
    export() {
        return 'This action exports customers data';
    }
    @Delete(':id')
    remove() {
        return 'This action removes a customer';
    }
}
