import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { TaskFilterDto } from '../shared/dto/task-filter.dto';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@Controller('tasks')
export class TasksController {

  constructor(private readonly tasksService: TasksService) {}

  @Auth( ValidRoles.admin, ValidRoles.supervisor )
  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }
  @Auth( ValidRoles.admin, ValidRoles.supervisor )
  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Auth()
  @Get('by-user')
  getTasks( @Query() filter: TaskFilterDto ) {
    return this.tasksService.getTasksByAssignedUserAndDate( filter );
  }

  @Auth( ValidRoles.admin, ValidRoles.supervisor )
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Auth( ValidRoles.admin, ValidRoles.supervisor )
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.tasksService.remove(+id);
  }

}