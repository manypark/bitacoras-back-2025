import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Concept } from './entities/concept.entity';
import { ConceptsService } from './concepts.service';
import { ConceptsController } from './concepts.controller';

@Module({
  controllers : [ConceptsController],
  providers   : [ConceptsService],
  imports     : [ TypeOrmModule.forFeature([Concept]) ],
})
export class ConceptsModule {}
