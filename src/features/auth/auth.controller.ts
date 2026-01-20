import { Controller, Post, Body } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateAuthDto, LoginUserDto } from './dto';
import { CreateMenuRoleDto } from '../menu-roles/dto';

@Controller('auth')
export class AuthController {
  
  constructor(private readonly authService: AuthService) {}

  @Post('singUp')
  signUp(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signUp(createAuthDto);
  }

  @Post('singUpComplete')
  signUpComplete(@Body() createAuthDto: CreateAuthDto, @Body() createMenuRoleDto : Omit<CreateMenuRoleDto, "idUser"> ) {
    return this.authService.signUpComplete(createAuthDto, createMenuRoleDto);
  }

  @Post('singIn')
  signIn(@Body() loginUserDto: LoginUserDto) {
    return this.authService.signIn(loginUserDto);
  }

  @Post('refreshToken')
  refresh( @Body('token') token:string ) {
    return this.authService.refreshToken(token);
  }

}
