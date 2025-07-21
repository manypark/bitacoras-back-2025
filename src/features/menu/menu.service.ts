import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Menu } from './entities/menu.entity';
import { CreateMenuDto, UpdateMenuDto } from './dto';
import { ResponseService } from '../shared/interceptors';

@Injectable()
export class MenuService {

  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    private readonly responseServices: ResponseService,
    private readonly dataSource: DataSource,
  ) {}

  // Create
  async create(createMenuDto: CreateMenuDto) {
    try {
      const menu = this.menuRepository.create({ ...createMenuDto });
      await this.menuRepository.save(menu);
      return this.responseServices.success('Menú creado correctamente', menu, 201);
    } catch (error) {
      return this.responseServices.error(`Error creando menú: ${error.detail}`, null, 400);
    }
  }

  // Find all
  async findAll() {
    try {
      const menus = await this.menuRepository.find({
        where: { active: true },
      });
      return this.responseServices.success('Menús cargados correctamente', menus, 200);
    } catch (error) {
      return this.responseServices.error(error.detail, null, 404);
    }
  }

  // Find one
  async findOne(id: number) {
    try {
      const menu = await this.menuRepository.findOneBy({ idMenu: id });
      if (!menu) return this.responseServices.error('Menú no encontrado', null, 404);
      return this.responseServices.success('Menú cargado correctamente', menu, 200);
    } catch (error) {
      return this.responseServices.error(error, null, 404);
    }
  }

  // Update
  async update(id: number, updateMenuDto: UpdateMenuDto) {
    const menu = await this.menuRepository.preload({ idMenu: id, ...updateMenuDto });
    if (!menu) return this.responseServices.error('Menú no encontrado', null, 404);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(menu);
      await queryRunner.commitTransaction();
      return this.responseServices.success('Menú actualizado correctamente', menu, 200);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return this.responseServices.error(error.detail, null, 500);
    } finally {
      await queryRunner.release();
    }
  }

  // Delete (soft delete)
  async remove(id: number) {
    try {
      await this.update(id, { active: false });
      return this.responseServices.success('Menú eliminado correctamente', null, 200);
    } catch (error) {
      return this.responseServices.error(error.detail, null, 500);
    }
  }
}
