import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Role } from './entities/role.entity';
import { PaginationDto } from '../shared/dto';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { ResponseService } from '../shared/interceptors';

@Injectable()
export class RolesService {

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository   : Repository<Role>,
    private readonly responseServices : ResponseService,
    private readonly dataSource       : DataSource,
  ) {}

// ####################### || Create Rol || #######################
  async create( createRoleDto : CreateRoleDto ) {
    try {
        const role = this.roleRepository.create({ ...createRoleDto });

        await this.roleRepository.save(role);

        return this.responseServices.success('Rol creado correctamente', role, 201);

    } catch (error) {
      return this.responseServices.error(`El rol no se pudo crear: ${error.detail}`, null, 400);
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
      await this.update(id, {active:false});
      return this.responseServices.success('Role elimnado correctamente', null, 202);
    } catch (error) {
      return this.responseServices.error(error.detail, null, 500);
    }
  }
}
