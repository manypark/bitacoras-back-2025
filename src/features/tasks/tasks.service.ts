import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Task } from './entities/task.entity';
import { ResponseService } from '../shared/interceptors';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { TaskFilterDto } from '../shared/dto/task-filter.dto';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository   : Repository<Task>,
    private readonly responseServices : ResponseService,
    private readonly dataSource       : DataSource,
  ) {}

// =========================================
// ============== Create Task ==============
// =========================================
  async create(createTaskDto: CreateTaskDto) {
    try {
      const task = this.taskRepository.create({ ...createTaskDto });
      await this.taskRepository.save(task);
      return this.responseServices.success('Tarea creado correctamente', task, 201);
    } catch (error) {
      return this.responseServices.error(`Error creando la tarea: ${error.detail}`, null, 400);
    }
  }

// =========================================
// ============== Fina all Tasks ===========
// =========================================
  async findAll() {
     try {
      const tasks = await this.taskRepository.find({ where: { active: true } });
      return this.responseServices.success('Tareas cargados correctamente', tasks, 200);
    } catch (error) {
      return this.responseServices.error(error.detail, null, 404);
    }
  }

  // =========================================
  // ======= Find one Task by User ===========
  // =========================================
  async getTasksByAssignedUserAndDate({ idUserAssigned, startDate, endDate }: TaskFilterDto) {
    try {
      const normalizeDayDate = endDate.split('-');
      let newDateNormalized = +normalizeDayDate[2] < 10 ? `${normalizeDayDate[0]}-${normalizeDayDate[1]}-0${normalizeDayDate[2]}` : endDate;
      newDateNormalized += 'T23:59:59';

      const query = this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.userAssigned', 'userAssigned')
        .leftJoin('task.logs', 'logs') // 👈 Relación con logs
        .addSelect('COUNT(logs.idLogs)', 'logsCount') // 👈 Contador de logs
        .where('task.userAssigned = :idUserAssigned', { idUserAssigned })
        .andWhere('task.createdAt >= :startDate', { startDate })
        .andWhere('task.createdAt <= :endDate', { endDate: newDateNormalized })
        .groupBy('task.idTasks') // 👈 Agrupar por ID de tarea
        .addGroupBy('userAssigned.idUser'); // 👈 Agrupar userAssigned también si se hace join-select

      // 👇 Trae el resultado crudo porque tienes agregados
      const tasks = await query.getRawAndEntities();

      tasks.entities.map( (ent) => delete ent.userAssigned.password );

      // Los conteos están en .raw y las tareas en .entities
      const result = tasks.entities.map((task, index) => ({
        ...task,
        logsCount: parseInt(tasks.raw[index].logsCount, 10) || 0,
      }));

      return this.responseServices.success('Tareas cargadas correctamente', result, 200);

    } catch (error) {
      return this.responseServices.error(error, null, 500);
    }
  }

// =========================================
// ============== Update Task ==============
// =========================================
  async update( idTask:number, updateTaskDto:UpdateTaskDto ) {
    const task = await this.taskRepository.preload({ idTasks: idTask, ...updateTaskDto });
    if (!task) return this.responseServices.error('Tarea no encontrada', null, 404);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(task);
      await queryRunner.commitTransaction();
      return this.responseServices.success('Tarea actualizada correctamente', task, 200);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return this.responseServices.error(error.detail, null, 500);
    } finally {
      await queryRunner.release();
    }
  }

// =========================================
// ============== Delete  Task =============
// =========================================
  async remove(id: number) {
    try {
      await this.update(id, { active: false });
      return this.responseServices.success('Tarea eliminada correctamente', null, 200);
    } catch (error) {
      return this.responseServices.error(error.detail, null, 500);
    }
  }

}
