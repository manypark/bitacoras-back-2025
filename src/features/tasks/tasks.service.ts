import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Task } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { ResponseService } from '../shared/interceptors';
import { TaskFilterDto } from '../shared/dto/task-filter.dto';
import { PaginationDto, TaskUsersFilterDto } from '../shared/dto';

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
  async findAll( { limit = 5, offset = 0 }: PaginationDto, { idUserAssigned = [], idUserCreated = [] }: TaskUsersFilterDto ) {
    try {
      const parsedLimit = Math.max(1, Number(limit) || 5);
      const parsedPage = Math.max(0, Number(offset) || 0);
      const rowOffset = parsedPage * parsedLimit;

      // 1) Obtener solo ids (paginar sobre ids evita duplicados por joins)
      const idsQb = this.taskRepository
        .createQueryBuilder('task')
        .select('task.idTasks', 'id')
        .leftJoin('task.userAssigned', 'userAssigned')
        .leftJoin('task.userCreated', 'userCreated');

      if (Array.isArray(idUserAssigned) && idUserAssigned.length > 0 && !idUserAssigned.includes(0)) {
        idsQb.andWhere('task.userAssignedIdUser IN (:...idUserAssigned)', { idUserAssigned });
      }

      if (Array.isArray(idUserCreated) && idUserCreated.length > 0 && !idUserCreated.includes(0)) {
        idsQb.andWhere('task.userCreatedIdUser IN (:...idUserCreated)', { idUserCreated });
      }

      idsQb.orderBy('task.createdAt', 'DESC').addOrderBy('task.idTasks', 'DESC').limit(parsedLimit).offset(rowOffset);

      const rawIds = await idsQb.getRawMany();
      const ids = rawIds.map((r) => Number(r.id));
      if (ids.length === 0) {
        return this.responseServices.success('Tareas cargadas correctamente', [], 200);
      }

      const rowsQb = this.taskRepository
        .createQueryBuilder('task')
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
        .addSelect(subQ => subQ
            .select('COUNT(*)')
            .from('logs', 'l')
            .where('l.idTasks = task.idTasks'),
          'logsCount',
        )
        .where('task.idTasks IN (:...ids)', { ids });

      rowsQb.orderBy(`array_position(ARRAY[:...ids]::int[], task.idTasks)`, 'ASC');

      const rawRows = await rowsQb.getRawMany();

      const result = rawRows.map((t) => ({
        idTasks: t.task_idTasks,
        title: t.task_title,
        description: t.task_description,
        active: t.task_active,
        createdAt: t.task_createdAt,
        userAssigned: {
          idUser: t.userAssigned_idUser,
          firstName: t.userAssigned_firstName,
          lastName: t.userAssigned_lastName,
          email: t.userAssigned_email,
        },
        userCreated: {
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
      const tasksTotals     = await this.taskRepository.count({});
      const tasksActives    = await this.taskRepository.count({ where: { active: true } });
      const tasksInactives  = await this.taskRepository.count({ where: { active: false }});

      return this.responseServices.success('Tareas cargados correctamente', {
        actives   : tasksActives,
        inactives : tasksInactives,
        totals    : tasksTotals,
      }, 202);

    } catch (error) {
      return this.responseServices.error(error.detail, null, 404);
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