import { Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Task } from './entities/task.entity';
import { PaginationDto } from '../shared/dto';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { ResponseService } from '../shared/interceptors';
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
  async findAll({ limit = 5, offset = 0 }: PaginationDto, { idUserAssigned = [], startDate, endDate }: TaskFilterDto, ) {
  try {
    const normalizeDayDate = endDate.split('-');
    let newDateNormalized = +normalizeDayDate[2] < 10 ? `${normalizeDayDate[0]}-${normalizeDayDate[1]}-0${normalizeDayDate[2]}` : endDate;
    newDateNormalized += 'T23:59:59';

    const query = this.taskRepository
      .createQueryBuilder('task')
      // 🔹 Selects mínimos para reducir ancho del JSON
      .select([
        'task.idTasks',
        'task.title',
        'task.description',
        'task.active',
        'task.createdAt',
        'userAssigned.idUser',
        'userAssigned.firstName',
        'userAssigned.lastName',
        'userAssigned.email',
        'userCreated.idUser',
        'userCreated.firstName',
        'userCreated.lastName',
        'userCreated.email',
      ])
      .leftJoin('task.userAssigned', 'userAssigned')
      .leftJoin('task.userCreated', 'userCreated')
      // 🔹 Subquery para contar logs (más rápido que GROUP BY)
      .addSelect((subQuery) =>
        subQuery
          .select('COUNT(*)')
          .from('logs', 'l')
          .where('l.idTasks = task.idTasks'),
        'logsCount',
      )
      // 🔹 Filtros por rango de fechas
      .where('task.createdAt >= :startDate', { startDate })
      .andWhere('task.createdAt <= :endDate', { endDate: newDateNormalized })
      // 🔹 Filtro por usuarios seleccionados
      .andWhere(idUserAssigned.length > 0 ? 'task.userAssignedIdUser IN (:...idUserAssigned)' : '1=1', {
        idUserAssigned,
      })
      // 🔹 Paginación + orden
      .orderBy('task.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      // 🔹 Cache de 5s (útil si recargas dashboard)
      .cache(5000);

    const tasks = await query.getRawMany();

    // 🔹 Mapear resultados
    const result = tasks.map((t) => ({
      idTasks: t.task_idTasks,
      title: t.task_title,
      description: t.task_description,
      active: t.task_active,
      createdAt: t.task_createdAt,
      userAssignedTo: {
        idUser: t.userAssigned_idUser,
        firstName: t.userAssigned_firstName,
        lastName: t.userAssigned_lastName,
        email: t.userAssigned_email,
      },
      userCreatedBy: {
        idUser: t.userCreated_idUser,
        firstName: t.userCreated_firstName,
        lastName: t.userCreated_lastName,
        email: t.userCreated_email,
      },
      logsCount: parseInt(t.logsCount, 10) || 0,
    }));

    return this.responseServices.success('Tareas cargadas correctamente', result, 200);
  } catch (error) {
    console.error(error);
    return this.responseServices.error(error.detail ?? 'Error al cargar tareas', null, 404);
  }
}


  // =========================================
  // ============== Find info tasks ===========
  // =========================================
  async findInfoTasks() {
    try {
      const tasksActives = await this.taskRepository.find({
        where: {
          active: true
        }
      });

      const tasksInactives = await this.taskRepository.find({
        where: {
          active: false
        }
      });

      const tasksTotals = await this.taskRepository.find({});

      return this.responseServices.success('Tareas cargados correctamente', {
        actives   : tasksActives.length,
        inactives : tasksInactives.length,
        totals    : tasksTotals.length,
      }, 202);

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
      await this.taskRepository.delete(id);
      return this.responseServices.success('Tarea eliminada correctamente', null, 200);
    } catch (error) {
      return this.responseServices.error(error.detail, null, 500);
    }
  }

}