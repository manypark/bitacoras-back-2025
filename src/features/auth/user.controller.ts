import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';

import { Auth } from './decorators';
import { UpdateAuthDto } from './dto';
import { AuthService } from './auth.service';
import { ValidRoles } from './interfaces/valid-roles';

@Controller('users')
export class UserController {
  
  constructor(private readonly userServices: AuthService) {}

  @Auth()
  @Get()
  findAll() {
    return this.userServices.findAll();
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
