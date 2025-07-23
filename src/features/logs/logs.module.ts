import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogsService } from './logs.service';
import { Logs } from './entities/logs.entity';
import { AuthModule } from '../auth/auth.module';
import { LogsController } from './logs.controller';
import { ResponseService } from '../shared/interceptors';

@Module({
  controllers : [ LogsController ],
  providers   : [ LogsService, ResponseService, ],
  imports     : [ TypeOrmModule.forFeature([Logs]), AuthModule ],
})
export class LogsModule {}
