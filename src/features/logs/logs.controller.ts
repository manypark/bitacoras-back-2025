import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

import { LogsService } from './logs.service';
import { CreateLogDto, UpdateLogDto } from './dto';
import { TaskFilterDto } from '../shared/dto/task-filter.dto';

@Controller('logs')
export class LogsController {

  constructor(private readonly logsService: LogsService) {}

  @Post()
  create(@Body() createLogDto: CreateLogDto) {
    return this.logsService.create(createLogDto);
  }

  @Get()
  findAll() {
    return this.logsService.findAll();
  }

  @Get('by-user')
  findOne( @Query() filter: TaskFilterDto ) {
    return this.logsService.getLogsUserCreatedAndDate( filter );
  }

  @Patch(':id')
  update(@Param('id') id:number, @Body() updateLogDto: UpdateLogDto) {
    return this.logsService.update(+id, updateLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id:number) {
    return this.logsService.remove(+id);
  }
}
