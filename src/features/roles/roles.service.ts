import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { Role } from './entities/role.entity';
import { PaginationDto } from '../shared/dto';
import { Menu } from '../menu/entities/menu.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { ResponseService } from '../shared/interceptors';

@Injectable()
export class RolesService {

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository   : Repository<Role>,
    @InjectRepository(Menu)
    private readonly menuRepository   : Repository<Menu>,
    private readonly responseServices : ResponseService,
    private readonly dataSource       : DataSource,
  ) {}

  // ####################### || Create Rol || #######################
  async create(createRoleDto: CreateRoleDto) {
    try {

      if (!createRoleDto.idMenus || createRoleDto.idMenus.length === 0) {
        return this.responseServices.error('Agrega menus para asignar', null, 501);
      }

      const role = this.roleRepository.create({
        name  : createRoleDto.name,
        active: createRoleDto.active
      });

      await this.roleRepository.save(role);

      await this.assignMenusToRole(role.idRoles, createRoleDto.idMenus);

      return this.responseServices.success('Rol creado correctamente', role, 201);

    } catch (error) {
      return this.responseServices.error(`El rol no se pudo crear: ${error.detail}`, null, 400);
    }
  }

  // ####################### || Asifgnarm menu a  Rol || #######################
  async assignMenusToRole(idRole: number, idMenus: number[]) {
    try {

      if (!idMenus || idMenus.length === 0) {
        return this.responseServices.error('Agrega menus para asignar', null, 501);
      }

      const role = await this.roleRepository.findOne({
        where: { idRoles: idRole },
        relations: ['menus'],
      });

      if (!role) throw new NotFoundException('Rol no encontrado');

      const menus = await this.menuRepository.findBy({
        idMenu: In(idMenus),
      });

      role.menus = menus;

      await this.roleRepository.save(role);

      return this.responseServices.success('Menu(s) asignados al rol correctamente', null, 202);

    } catch (error) {
      console.log(error);
      return this.responseServices.error(error.detail, null, 501);
    }
  }

// ####################### || Find all Roles || #######################
  async findAll({ limit = 5, offset = 0 } : PaginationDto ) {
    try {
      const roles = await this.roleRepository.find({
        take      : limit, 
        skip      : offset,
        order: {
            idRoles: "ASC",
        },
      });

      return this.responseServices.success('Roles cargados correctamente', roles, 202);

    } catch (error) {
      return this.responseServices.error(error.detail, null, 404);
    }
  }

// ####################### || Find Roles Info || #######################
  async findInfoRoles() {
    try {
      const rolesActive = await this.roleRepository.find({
        where: {
          active: true
        }
      });

      const rolesInactive = await this.roleRepository.find({
        where: {
          active: false
        }
      });

      const rolesTotals = await this.roleRepository.find({});

      return this.responseServices.success('Roles cargados correctamente', {
        actives   : rolesActive.length,
        inactives : rolesInactive.length,
        totals    : rolesTotals.length,
      }, 202);

    } catch (error) {
      return this.responseServices.error(error.detail, null, 404);
    }
  }

// ####################### || Find one rol || #######################  
  async findOne( idRole:number ) {
    try {
      const role = await this.roleRepository.findOneBy({ idRoles: idRole });

      if( !role ) return this.responseServices.error('Rol no encontrado', null, 404);

      return this.responseServices.success('Role cargado correctamente', role, 202);

    } catch (error) {
      return this.responseServices.error(error, null, 404);
    }
  }

// ####################### || Update rol || #######################
  async update( idRole:number, updateRoleDto:UpdateRoleDto ) {
    
    const role = await this.roleRepository.preload({ idRoles:idRole, ...updateRoleDto });

    if( !role ) return this.responseServices.error('Role no encontrado');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      
      await queryRunner.manager.save(role);
      await queryRunner.commitTransaction();

      if (!updateRoleDto.idMenus || updateRoleDto.idMenus.length === 0) {
        return this.responseServices.error('Agrega menus para asignar', null, 501);
      }

      await this.assignMenusToRole(role.idRoles, updateRoleDto.idMenus!);

      return this.responseServices.success('Rol actualizado correctamente', role, 202);

    } catch (error) {

      await queryRunner.rollbackTransaction();
      return this.responseServices.error(error.detail, null, 500);

    } finally {
      await queryRunner.release();
    }

  }

// ####################### || Delete rol || #######################
  async remove(id: number) {
    try {
      const role = await this.roleRepository.findOneBy({ idRoles: id });
      if( !role ) return this.responseServices.error('Rol no encontrado', null, 404);
      await this.roleRepository.remove(role);
      return this.responseServices.success('Role eliminado correctamente', null, 202);
    } catch (error) {
      return this.responseServices.error(error.detail, null, 500);
    }
  }
}