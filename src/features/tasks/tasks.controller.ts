import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

import { Auth } from '../auth/decorators';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { PaginationDto, TaskFilterDto, TaskUsersFilterDto } from '../shared';

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
  findAll( @Query() paginationDto:PaginationDto, @Query() usersFilters:TaskUsersFilterDto ) {
    return this.tasksService.findAll( paginationDto, usersFilters );
  }

  @Auth( ValidRoles.admin, ValidRoles.supervisor )
  @Get('/info')
  findInfoTasks() {
    return this.tasksService.findInfoTasks();
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