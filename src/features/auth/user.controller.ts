import { Controller, Get, Body, Patch, Param, Delete, Query } from '@nestjs/common';

import { Auth } from './decorators';
import { UsersFilterDto } from '../shared';
import { AuthService } from './auth.service';
import { PaginationDto, UpdateAuthDto } from './dto';
import { ValidRoles } from './interfaces/valid-roles';

@Controller('users')
export class UserController {
  
  constructor(private readonly userServices: AuthService) {}

  @Auth()
  @Get()
  findAll() {
    return this.userServices.finAllUsers();
  }

  @Auth()
  @Get('/filtered')
  findAllUsersFiltered( @Query() paginationDto:PaginationDto, @Query() usersFilters:UsersFilterDto ) {
    return this.userServices.findAllUsersFiltered( paginationDto, usersFilters );
  }

  @Auth( ValidRoles.admin, ValidRoles.supervisor )
  @Get('/info')
  findInfoUsers() {
    return this.userServices.findInfoUsers();
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
