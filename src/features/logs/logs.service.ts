import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { LogsFilterDto } from '../shared';
import { Logs } from './entities/logs.entity';
import { CreateLogDto, UpdateLogDto } from './dto';
import { ResponseService } from '../shared/interceptors';

@Injectable()
export class LogsService {

   constructor(
    @InjectRepository(Logs)
    private readonly logsRepository   : Repository<Logs>,
    private readonly responseServices : ResponseService,
    private readonly dataSource       : DataSource,
  ) {}

// =========================================
// ============== Create Log ===============
// =========================================
  async create( createLogDto:CreateLogDto ) {
    try {
      const logs = this.logsRepository.create({ ...createLogDto });
      await this.logsRepository.save(logs);
      return this.responseServices.success('Bitacora creado correctamente', logs, 201);
    } catch (error) {
      return this.responseServices.error(`Error creando bitacora: ${error.detail}`, null, 400);
    }
  }

  // =========================================
  // ============== Get all logs =============
  // =========================================
  async findAll() {
    try {
      const logs = await this.logsRepository.find({ where: { active: true } });
      return this.responseServices.success('Bitacoras cargados correctamente', logs, 200);
    } catch (error) {
      return this.responseServices.error(error.detail, null, 404);
    }
  }

  // =========================================
  // ============== Get logs info =============
  // =========================================
  async findInfoLogs() {
    try {
      const logsTotals     = await this.logsRepository.count({});
      const logsActives    = await this.logsRepository.count({ where: { active: true } });
      const logsInactives  = await this.logsRepository.count({ where: { active: false }});

      return this.responseServices.success('Bitacoras cargados correctamente', {
        actives   : logsActives,
        inactives : logsInactives,
        totals    : logsTotals,
      }, 202);

    } catch (error) {
      return this.responseServices.error(error.detail, null, 404);
    }
  }

  // =========================================
  // ======= Find one Log by User ============
  // =========================================
  async getLogsByUserAndFilters({
    idUserAssigned,
    idConcepts = [],
    startDate,
    endDate,
    limit = 5,
    offset = 0,
  }:LogsFilterDto ) {
    try {
      const query = this.logsRepository
        .createQueryBuilder('logs')
        .leftJoinAndSelect('logs.idUser', 'userAssigned')
        .leftJoinAndSelect('logs.idConcept', 'concept')
        .select([
          'logs.idLogs',
          'logs.description',
          'logs.image_url',
          'logs.latitud',
          'logs.longitud',
          'logs.createdAt',
          'concept.idConcept',
          'concept.description',
          'userAssigned.idUser',
          'userAssigned.firstName',
          'userAssigned.lastName',
          'userAssigned.email',
        ]);

      // 🔹 Filtro por usuarios asignados
      if (Array.isArray(idUserAssigned) && idUserAssigned.length > 0 && !idUserAssigned.includes(0)) {
        query.andWhere('logs.idUser IN (:...idUserAssigned)', { idUserAssigned });
      }

      // 🔹 Filtro por conceptos
      if (Array.isArray(idConcepts) && idConcepts.length > 0 && !idConcepts.includes(0)) {
        query.andWhere('logs.idConcept IN (:...idConcepts)', { idConcepts });
      }

      // 🔹 Filtro por fechas
      if (startDate && endDate) {
        const normalizedEnd = `${endDate}T23:59:59`;
        query.andWhere('logs.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate: normalizedEnd,
        });
      } else if (startDate) {
        query.andWhere('logs.createdAt >= :startDate', { startDate });
      } else if (endDate) {
        const normalizedEnd = `${endDate}T23:59:59`;
        query.andWhere('logs.createdAt <= :endDate', { endDate: normalizedEnd });
      }

      // 🔹 Orden + paginación
      query.orderBy('logs.createdAt', 'DESC');

      // ✅ Aquí va la paginación (en Postgres skip = OFFSET, limit = LIMIT)
      query.skip(offset * limit).take(limit);

      const logs = await query.getMany();

      // 🔹 Limpieza de rutas de imagen
      const cleanUrl = (url?: string | null) => url ? url.replace(/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//, '') : null;

      const sanitizedLogs = logs.map((log) => ({ ...log, image_url: cleanUrl(log.image_url) }));

      return this.responseServices.success('Bitácoras cargadas correctamente', sanitizedLogs, 200);
    } catch (error) {
      console.error(error);
      return this.responseServices.error(error.detail ?? 'Error al cargar bitácoras', null, 500);
    }
  }

// =========================================
// ============== Update Log ==============
// =========================================
  async update( idLog:number, updateLogDto:UpdateLogDto ) {

    const logs = await this.logsRepository.preload({ idLogs:idLog, ...updateLogDto });
    if (!logs) return this.responseServices.error('Bitacora no encontrado', null, 404);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(logs);
      await queryRunner.commitTransaction();
      return this.responseServices.success('Bitacora actualizada correctamente', logs, 200);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return this.responseServices.error(error.detail, null, 500);
    } finally {
      await queryRunner.release();
    }
  }

// =========================================
// ============== Delete log ===============
// =========================================
  async remove(id: number) {
    try {
      await this.update(id, { active: false });
      return this.responseServices.success('Bitacora eliminado correctamente', null, 200);
    } catch (error) {
      return this.responseServices.error(error.detail, null, 500);
    }
  }
}
