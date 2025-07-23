import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Logs } from './entities/logs.entity';
import { CreateLogDto, UpdateLogDto } from './dto';
import { ResponseService } from '../shared/interceptors';
import { TaskFilterDto } from '../shared/dto/task-filter.dto';

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
// ======= Find one Log by User ============
// =========================================
  async getLogsUserCreatedAndDate( { idUserAssigned, startDate, endDate } : TaskFilterDto ) {

    try {

      const normalizeDayDate = endDate.split('-');
      let newDateNormalized = +normalizeDayDate[2] < 10 ? `${normalizeDayDate[0]}-${normalizeDayDate[1]}-0${normalizeDayDate[2]}` : endDate;
      newDateNormalized += 'T23:59:59';

      const query = this.logsRepository.createQueryBuilder('logs')
        .leftJoinAndSelect('logs.idUser', 'userAssigned')
        .where('logs.idUser = :idUserAssigned', { idUserAssigned })
        .andWhere('logs.createdAt >= :startDate', { startDate })
        .andWhere('logs.createdAt <= :endDate', { endDate : newDateNormalized });
  
      const logs = await query.getMany();

      return this.responseServices.success('Bitacoras cargada correctamente', logs, 200);
      
    } catch (error) {
      return this.responseServices.success(error, null, 500);
    }

  }

// =========================================
// ============== Update Task ==============
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
