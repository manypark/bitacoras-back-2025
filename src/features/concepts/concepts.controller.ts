import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';

import { Auth } from '../auth/decorators';
import { PaginationDto } from '../shared/dto';
import { ConceptsService } from './concepts.service';
import { CreateConceptDto, UpdateConceptDto } from './dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@Controller('concepts')
export class ConceptsController {

  constructor(private readonly conceptsService: ConceptsService) {}

  @Auth( ValidRoles.admin )
  @Post()
  create(@Body() createConceptDto: CreateConceptDto) {
    return this.conceptsService.create(createConceptDto);
  }

  @Auth()
  @Get()
  findAll( @Query() paginationDto:PaginationDto ) {
    return this.conceptsService.findAll( paginationDto );
  }

  @Auth()
  @Get('/info')
  findInfoConcepts() {
    return this.conceptsService.findInfoConcepts();
  }

  @Auth()
  @Get(':id')
  findOne(@Param('id') id:number) {
    return this.conceptsService.findOne(+id);
  }

  @Auth( ValidRoles.admin )
  @Patch(':id')
  update(@Param('id') id:number, @Body() updateConceptDto: UpdateConceptDto) {
    return this.conceptsService.update(+id, updateConceptDto);
  }

  @Auth( ValidRoles.admin )
  @Delete(':id')
  remove(@Param('id') id:number) {
    return this.conceptsService.remove(+id);
  }
}
