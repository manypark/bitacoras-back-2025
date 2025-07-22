import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  controllers : [ TasksController ],
  providers   : [ TasksService ],
  imports     : [ TypeOrmModule.forFeature([Task]) ],
})
export class TasksModule {}
