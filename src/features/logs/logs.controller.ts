import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

import { Auth } from '../auth/decorators';
import { LogsService } from './logs.service';
import { CreateLogDto, UpdateLogDto } from './dto';
import { TaskFilterDto } from '../shared/dto/task-filter.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@Controller('logs')
export class LogsController {

  constructor(private readonly logsService: LogsService) {}

  @Post()
  create(@Body() createLogDto: CreateLogDto) {
    return this.logsService.create(createLogDto);
  }

  @Auth( ValidRoles.admin, ValidRoles.supervisor )
  @Get()
  findAll() {
    return this.logsService.findAll();
  }

  @Auth( ValidRoles.admin, ValidRoles.supervisor )
  @Get('by-user')
  findOne( @Query() filter: TaskFilterDto ) {
    return this.logsService.getLogsUserCreatedAndDate( filter );
  }

  @Auth( ValidRoles.admin, ValidRoles.supervisor )
  @Patch(':id')
  update(@Param('id') id:number, @Body() updateLogDto: UpdateLogDto) {
    return this.logsService.update(+id, updateLogDto);
  }

  @Auth( ValidRoles.admin, ValidRoles.supervisor )
  @Delete(':id')
  remove(@Param('id') id:number) {
    return this.logsService.remove(+id);
  }
}
