import { Controller, Get, Body, Patch, Param, Delete, Query } from '@nestjs/common';

import { Auth } from './decorators';
import { AuthService } from './auth.service';
import { PaginationDto, UpdateAuthDto } from './dto';

@Controller('users')
export class UserController {
  
  constructor(private readonly userServices: AuthService) {}

  @Auth()
  @Get()
  findAll( @Query() paginationDto:PaginationDto ) {
    return this.userServices.findAll(paginationDto);
  }

  @Auth()
  @Get(':id')
  findOne( @Param('id') id:number ) {
    return this.userServices.findOne(id);
  }

  @Auth()
  @Patch(':id')
  update( 
    @Param('id') id : number, 
    @Body() updateAuthDto : UpdateAuthDto,
  ) {
    return this.userServices.update(+id, updateAuthDto);
  }

  @Auth()
  @Delete(':id')
  remove( @Param('id') id : number ) {
    return this.userServices.remove(+id);
  }
}
