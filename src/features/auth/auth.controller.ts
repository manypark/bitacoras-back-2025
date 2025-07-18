import { Controller, Post, Body } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateAuthDto, LoginUserDto } from './dto';

@Controller('auth')
export class AuthController {
  
  constructor(private readonly authService: AuthService) {}

  @Post('singUp')
  signUp(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signUp(createAuthDto);
  }

  @Post('singIn')
  signIn(@Body() loginUserDto: LoginUserDto) {
    return this.authService.signIn(loginUserDto);
  }

}
