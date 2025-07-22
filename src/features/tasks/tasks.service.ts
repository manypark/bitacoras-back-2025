import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Task } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { ResponseService } from '../shared/interceptors';

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
// ============== Find one Task ============
// =========================================
  async findOne( idTask:number) {
    try {
      const task = await this.taskRepository.findOneBy({ idTasks: idTask });
      if (!task) return this.responseServices.error('Tarea no encontrada', null, 404);
      return this.responseServices.success('Tarea cargada correctamente', task, 200);
    } catch (error) {
      return this.responseServices.error(error, null, 404);
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
