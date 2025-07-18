import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

import { AuthService } from './auth.service';
import { PaginationDto, UpdateAuthDto } from './dto';

@Controller('users')
export class UserController {
  
  constructor(private readonly userServices: AuthService) {}

  @Get()
  findAll( @Query() paginationDto:PaginationDto ) {
    return this.userServices.findAll(paginationDto);
  }

  @Get(':id')
  findOne( @Param('id') id:number ) {
    return this.userServices.findOne(id);
  }

  @Patch(':id')
  update( 
    @Param('id') id : number, 
    @Body() updateAuthDto : UpdateAuthDto,
  ) {
    return this.userServices.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userServices.remove(id);
  }
}
