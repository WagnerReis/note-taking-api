import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor() {}

  @Post()
  create(@Body() createUserDto: any) {
    // implement
  }

  @Get()
  findAll() {
    // implement
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // implement
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    // implement
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // implement
  }
}
