import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ResponseService } from '../shared/interceptors';

@Module({
  controllers : [ TasksController ],
  providers   : [ TasksService, ResponseService, ],
  imports     : [ TypeOrmModule.forFeature([Task]) ],
})
export class TasksModule {}
