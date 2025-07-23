import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { Auth } from '../auth/decorators';
import { ConceptsService } from './concepts.service';
import { CreateConceptDto, UpdateConceptDto } from './dto';

@Controller('concepts')
export class ConceptsController {

  constructor(private readonly conceptsService: ConceptsService) {}

  @Auth()
  @Post()
  create(@Body() createConceptDto: CreateConceptDto) {
    return this.conceptsService.create(createConceptDto);
  }

  @Auth()
  @Get()
  findAll() {
    return this.conceptsService.findAll();
  }

  @Auth()
  @Get(':id')
  findOne(@Param('id') id:number) {
    return this.conceptsService.findOne(+id);
  }

  @Auth()
  @Patch(':id')
  update(@Param('id') id:number, @Body() updateConceptDto: UpdateConceptDto) {
    return this.conceptsService.update(+id, updateConceptDto);
  }

  @Auth()
  @Delete(':id')
  remove(@Param('id') id:number) {
    return this.conceptsService.remove(+id);
  }
}
