import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { ResponseService } from '../shared/interceptors';
import { MenuRoles } from './entities/menu-role.entity';
import { CreateMenuRoleDto, UpdateMenuRoleDto } from './dto';

@Injectable()
export class MenuRolesService {

  constructor(
    @InjectRepository(MenuRoles)
    private readonly menuRolesRepository: Repository<MenuRoles>,
    private readonly responseServices: ResponseService,
    private readonly dataSource: DataSource,
  ) {}

  // Create
  async create(createMenuRolesDto: CreateMenuRoleDto) {
    try {
      const menuRole = this.menuRolesRepository.create({ ...createMenuRolesDto });
      await this.menuRolesRepository.save(menuRole);
      return this.responseServices.success('Permiso menu-rol creado correctamente', menuRole, 201);
    } catch (error) {
      return this.responseServices.error(`Error creando menu-rol: ${error.detail}`, null, 400);
    }
  }

  // Find all
  async findAll() {
    try {
      const menuRoles = await this.menuRolesRepository.find({});
      return this.responseServices.success('Permisos menu-rol cargados correctamente', menuRoles, 200);
    } catch (error) {
      return this.responseServices.error(error.detail, null, 404);
    }
  }

  // Find one
  async findOne(id: number) {
    try {
      const menuRole = await this.menuRolesRepository.findOne({
        where: { idMenuRoles: id },
      });
      if (!menuRole) return this.responseServices.error('Menu-Rol no encontrado', null, 404);
      return this.responseServices.success('Menu-Rol cargado correctamente', menuRole, 200);
    } catch (error) {
      return this.responseServices.error(error, null, 404);
    }
  }

  // Update
  async update(id: number, updateMenuRolesDto: UpdateMenuRoleDto) {
    const menuRole = await this.menuRolesRepository.preload({ idMenuRoles: id, ...updateMenuRolesDto });
    if (!menuRole) return this.responseServices.error('Menu-Rol no encontrado', null, 404);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(menuRole);
      await queryRunner.commitTransaction();
      return this.responseServices.success('Menu-Rol actualizado correctamente', menuRole, 200);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return this.responseServices.error(error.detail, null, 500);
    } finally {
      await queryRunner.release();
    }
  }

  // Delete (elimina físico)
  async remove(id: number) {
    try {
      const menuRole = await this.menuRolesRepository.findOneBy({ idMenuRoles: id });
      if (!menuRole) return this.responseServices.error('Menu-Rol no encontrado', null, 404);

      await this.menuRolesRepository.remove(menuRole);
      return this.responseServices.success('Menu-Rol eliminado correctamente', null, 200);
    } catch (error) {
      return this.responseServices.error(error.detail, null, 500);
    }
  }
}
