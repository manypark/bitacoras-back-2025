import { Controller, Get, Body, Patch, Param, Delete, Query } from '@nestjs/common';

import { Auth } from './decorators';
import { AuthService } from './auth.service';
import { PaginationDto, UpdateAuthDto } from './dto';
import { ValidRoles } from './interfaces/valid-roles';

@Controller('users')
export class UserController {
  
  constructor(private readonly userServices: AuthService) {}

  @Auth()
  @Get()
  findAll( @Query() paginationDto:PaginationDto ) {
    return this.userServices.findAll(paginationDto);
  }

  @Auth( ValidRoles.admin )
  @Get(':id')
  findOne( @Param('id') id:number ) {
    return this.userServices.findOne(id);
  }

  @Auth( ValidRoles.admin )
  @Patch(':id')
  update( 
    @Param('id') id : number, 
    @Body() updateAuthDto : UpdateAuthDto,
  ) {
    return this.userServices.update(+id, updateAuthDto);
  }

  @Auth( ValidRoles.admin )
  @Delete(':id')
  remove( @Param('id') id : number ) {
    return this.userServices.remove(+id);
  }
}
