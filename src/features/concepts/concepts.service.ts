import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { PaginationDto } from '../shared/dto';
import { Concept } from './entities/concept.entity';
import { ResponseService } from '../shared/interceptors';
import { CreateConceptDto, UpdateConceptDto } from './dto';

@Injectable()
export class ConceptsService {

  constructor(
      @InjectRepository(Concept)
      private readonly conceptRepository: Repository<Concept>,
      private readonly responseServices: ResponseService,
      private readonly dataSource: DataSource,
    ) {}

  async create(createConceptDto: CreateConceptDto) {
    try {
      const concept = this.conceptRepository.create({ ...createConceptDto });
      await this.conceptRepository.save(concept);
      return this.responseServices.success('Concepto creado correctamente', concept, 201);
    } catch (error) {
      return this.responseServices.error(`Error creando concepto: ${error.detail}`, null, 400);
    }
  }

  async findAll( { limit = 5, offset = 0 } : PaginationDto  ) {
    try {
      const concepts = await this.conceptRepository.find({
        take      : limit, 
        skip      : offset,
        order: {
            idConcept: "ASC",
        },
      });
      return this.responseServices.success('Conceptos cargados correctamente', concepts, 200);
    } catch (error) {
      return this.responseServices.error(error.detail, null, 404);
    }
  }

  async findInfoConcepts() {
    try {
      const conceptsActives = await this.conceptRepository.find({
        where: {
          active: true
        }
      });
      const conceptsInactives = await this.conceptRepository.find({
        where: {
          active: false
        }
      });
      const conceptsTotals = await this.conceptRepository.find({});

      return this.responseServices.success('Roles cargados correctamente', {
        actives   : conceptsActives.length,
        inactives : conceptsInactives.length,
        totals    : conceptsTotals.length,
      }, 202);

    } catch (error) {
      return this.responseServices.error(error.detail, null, 404);
    }
  }

  async findOne( idConcept:number ) {
    try {
      const menu = await this.conceptRepository.findOneBy({ idConcept:idConcept });
      if (!menu) return this.responseServices.error('Concepto no encontrado', null, 404);
      return this.responseServices.success('Concepto cargado correctamente', menu, 200);
    } catch (error) {
      return this.responseServices.error(error, null, 404);
    }
  }

  async update( idConcept:number, updateConceptDto: UpdateConceptDto) {

    const concept = await this.conceptRepository.preload({ idConcept: idConcept, ...updateConceptDto });
    if (!concept) return this.responseServices.error('Concepto no encontrado', null, 404);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(concept);
      await queryRunner.commitTransaction();
      return this.responseServices.success('Concepto actualizado correctamente', concept, 200);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return this.responseServices.error(error.detail, null, 500);
    } finally {
      await queryRunner.release();
    }

  }

  async remove( idConcept:number ) {
    try {
      await this.update( idConcept, { active: false } );
      return this.responseServices.success('Concepto eliminado correctamente', null, 200);
    } catch (error) {
      return this.responseServices.error(error.detail, null, 500);
    }
  }
}
