import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ResponseService } from '../shared/interceptors';
import { MenuRolesModule } from '../menu-roles/menu-roles.module';

@Module({
  controllers : [
    AuthController, 
    UserController,
  ],
  providers   : [
    AuthService, 
    JwtStrategy,
    ResponseService,
  ],
  imports     : [
    TypeOrmModule.forFeature([ User ]),
    PassportModule.register( { defaultStrategy: 'jwt' } ),
    JwtModule.registerAsync({
      imports   : [ ConfigModule ],
      inject    : [ ConfigService ],
      useFactory: ( configServices:ConfigService ) => ({
          secret      :  configServices.get('JWT_SECRET'),
          signOptions : { expiresIn: '100h' },
      })
    }),
    ConfigModule,
    MenuRolesModule,
  ],
  exports : [ 
    TypeOrmModule, 
    JwtStrategy, 
    PassportModule, 
    JwtModule,
  ]
})
export class AuthModule {}
