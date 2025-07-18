import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';

@Module({
  controllers : [AuthController],
  providers   : [AuthService],
  imports     : [
    TypeOrmModule.forFeature([ User ]),
    ConfigModule,
  ],
})
export class AuthModule {}
