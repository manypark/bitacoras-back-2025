import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { ResponseService } from '../shared/interceptors';

@Module({
  controllers : [AuthController],
  providers   : [
    AuthService, 
    ResponseService,
  ],
  imports     : [
    TypeOrmModule.forFeature([ User ]),
    ConfigModule,
  ],
})
export class AuthModule {}
