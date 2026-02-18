import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { TasksController } from './tasks.controller';
import { ResponseService } from '../shared/interceptors';
import { NotificationsService } from '../firebase/firebase.service';

@Module({
  controllers : [ TasksController ],
  providers   : [ 
    TasksService, 
    AuthService,
    ResponseService,
    NotificationsService,
  ],
  imports     : [ 
    TypeOrmModule.forFeature([Task]), 
    AuthModule,
   ],
})
export class TasksModule {}
