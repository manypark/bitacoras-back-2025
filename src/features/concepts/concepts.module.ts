import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Concept } from './entities/concept.entity';
import { ConceptsService } from './concepts.service';
import { ResponseService } from '../shared/interceptors';
import { ConceptsController } from './concepts.controller';

@Module({
  controllers : [ ConceptsController ],
  providers   : [ ConceptsService, ResponseService, ],
  imports     : [ TypeOrmModule.forFeature([Concept]), AuthModule ],
})
export class ConceptsModule {}
