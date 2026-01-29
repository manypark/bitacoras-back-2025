import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { UsersFilterDto } from '../shared';
import { User } from './entities/user.entity';
import { OnlyUserResponseMapper } from './mappers';
import { Role } from '../roles/entities/role.entity';
import { ResponseService } from '../shared/interceptors';
import { UserResponseMapper } from './mappers/user-response.mapper';
import { CreateAuthDto, UpdateAuthDto, LoginUserDto, PaginationDto } from './dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)      
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly responseService:ResponseService,
    private readonly dataSource:DataSource,
    private readonly jwtServices:JwtService,
  ) {}
  
// ####################### || User Register || #######################
  async signUp(createAuthDto: CreateAuthDto) {
    try {

      if(!createAuthDto.avatarUrl) createAuthDto.avatarUrl = process.env.AVATAR_URL_PROFILE ?? '';

      const newUser = this.userRepository.create({ ...createAuthDto });

      await this.userRepository.save( newUser );

      return this.responseService.success('Usuario creado correctamente', newUser, 201);

    } catch (error) {
      return this.responseService.error(error.detail, null, 500);
    }
  }

// ####################### || User Register Complete || #######################
  async signUpComplete( createAuthDto : CreateAuthDto, idRoles:number[] ) {
    try {

      if(!createAuthDto.avatarUrl) createAuthDto.avatarUrl = process.env.AVATAR_URL_PROFILE ?? '';

      const newUser = this.userRepository.create({ ...createAuthDto });

      await this.userRepository.save( newUser );

      await this.assignRolesToUser( newUser.idUser, idRoles);

      await this.userRepository.save(newUser);
      
      return this.responseService.success('Usuario creado correctamente', newUser, 201);
    } catch (error) {
      console.log(error);
      return this.responseService.error(error.detail, null, 500);
    }
  }

  // ####################### || User Login || #######################
  async signIn({ email, password } : LoginUserDto) {

    try {
      
      const loginUser = await this.userRepository.findOne({
        where: { email, active: true },
        relations: {
          roles: { menus: true },
        },
      });
  
      if( !loginUser ) return this.responseService.error('Usuario no encontrado o desactivado', null, 404);
  
      if( !bcrypt.compareSync(password, loginUser.password!) ) 
        return this.responseService.error('Usuario o contrasena no coinciden', null, 401);

      const userResponse = UserResponseMapper.userResponseMapper( loginUser );

      const data = {
        token: this.getJwtToken( loginUser.email ),
        ...userResponse,
      };
  
      return this.responseService.success('Usuario loguedo correctamente', data, 202);

    } catch (error) {
      return this.responseService.error(error, null, 500);
    }
  }

  // ================================================
  // ✅ Nuevo: Refresh Token usando el token viejo
  // ================================================
  async refreshToken( token : string ) {
    try {
      // Verifica el token anterior
      const decoded = this.jwtServices.verify(token, {ignoreExpiration:true});
      const email = decoded.email;

      if (!email) {
        return this.responseService.error('Token inválido: sin email', null, 401);
      }

      // Busca que el usuario exista y siga activo
      const user = await this.userRepository.findOne({ where: { email, active: true } });
      
      if (!user) {
        return this.responseService.error('Usuario no encontrado o inactivo', null, 404);
      }

      // Genera un nuevo token
      const newToken = this.jwtServices.sign({ email: user.email });

      return this.responseService.success('Nuevo token generado', { token: newToken }, 200);

    } catch (error) {
      return this.responseService.error('Token inválido o expirado', null, 500);
    }
  }

// ####################### || Generate JWT || #######################  
  private getJwtToken( email:string ):string {
    const token = this.jwtServices.sign({ email });
    return token;
  }

// ####################### || Get all users || #######################
  async finAllUsers() {
    const users = await this.userRepository.find({});

    const userMapped = users.map( user => OnlyUserResponseMapper.userResponseMapper( user ) );

    return this.responseService.success('Usuario cargado correctamente', userMapped, 202);
  }

// ####################### || Get all users filtered || #######################
  async findAllUsersFiltered( { limit = 5, offset = 0 }: PaginationDto, { idUsers = [], idRoles = [] }: UsersFilterDto ) {
    try {
      const parsedLimit = Math.max(1, Number(limit) || 5);
      const parsedPage = Math.max(0, Number(offset) || 0);
      const rowOffset = parsedPage * parsedLimit;

      const query = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'roles')
        .leftJoinAndSelect('roles.menus', 'menus')
        .select([
          'user.idUser',
          'user.firstName',
          'user.lastName',
          'user.email',
          'user.active',
          'user.avatarUrl',
          'user.lastLogin',
          'user.createdAt',
          'user.updatedAt',

          'roles.idRoles',
          'roles.name',

          'menus.idMenu',
          'menus.name',
          'menus.route',
          'menus.icon',
        ])
        .orderBy('user.idUser', 'DESC')
        .skip(rowOffset)
        .take(parsedLimit);

      // Filtro por usuarios
      if (Array.isArray(idUsers) && idUsers.length > 0 && !idUsers.includes(0)) {
        query.andWhere('user.idUser IN (:...idUsers)', { idUsers });
      }

      // Filtro por roles
      if (Array.isArray(idRoles) && idRoles.length > 0 && !idRoles.includes(0)) {
        query.andWhere('roles.idRoles IN (:...idRoles)', { idRoles });
      }

      const users = await query.getMany();

      const response = users.map((user) => {

      const menusMap = new Map<number, any>();

      const rolesList = user.roles.map((role) => {
        role.menus?.forEach((menu) => {
          if (!menusMap.has(menu.idMenu)) {
            menusMap.set(menu.idMenu, {
              idMenu: menu.idMenu,
              name: menu.name,
              route: menu.route,
              icon: menu.icon,
            });
          }
        });

        return { idRoles: role.idRoles, name: role.name };
      });

        return {
          idUser: user.idUser,
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
          },
          email: user.email,
          active: user.active,
          avatarUrl: user.avatarUrl,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          rolesList,
          menusList: Array.from(menusMap.values()),
        };
      });

      return this.responseService.success( 'Usuarios cargados correctamente', response, 200 );
    } catch (error) {
      console.error(error);
      return this.responseService.error(error);
    }
  }

  // ####################### || Get info users || #######################
  async findInfoUsers() {
    try {
        const usersActives = await this.userRepository.count({ where: { active: true }});
        const usersInActives = await this.userRepository.count({ where: { active: false }});
        const usersTotals = await this.userRepository.count();

        return this.responseService.success('Usuarios info cargados correctamente', {
          actives   : usersActives,
          inactives : usersInActives,
          totals    : usersTotals,
        }, 202);
    } catch (error) {
      console.error(error);
      return this.responseService.error(error.detail, null, 404);
    }
  }

// ####################### || Get one user || #######################
  async findOne( idUser:number) {
     try {
      const user = await this.userRepository.findOne({
        where: { idUser, active: true },
        relations: {
          roles: {
            menus: true,
          },
        },
      })

      delete user?.password;

      if( !user ) return this.responseService.error('Usuario no encontrado', null, 404);

      const userResponse = UserResponseMapper.userResponseMapper( user );

      return this.responseService.success('Usuario cargado correctamente', userResponse, 202);
      
    } catch (error) {
     return this.responseService.error(error);
    }
  }

// ####################### || Update one user || #######################
  async update(idUser: number, updateUser: UpdateAuthDto) {

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      await queryRunner.manager.update(User, idUser, {
        firstName : updateUser.firstName,
        lastName  : updateUser.lastName,
        email     : updateUser.email,
        active    : updateUser.active,
        avatarUrl : updateUser.avatarUrl,
        password  : updateUser.password,
      });

      if (updateUser.idRoles) {
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from('user_roles')
          .where('idUser = :idUser', { idUser })
          .execute();

        if (updateUser.idRoles.length > 0) {
          const values = updateUser.idRoles.map((idRole) => ({
            idUser,
            idRole,
          }));

          await queryRunner.manager
            .createQueryBuilder()
            .insert()
            .into('user_roles')
            .values(values)
            .execute();
        }
      }

      await queryRunner.commitTransaction();

      return this.responseService.success( 'Usuario actualizado correctamente', null, 202);

    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      return this.responseService.error( error.detail ?? 'Error interno', null, 500);
    } finally {
      await queryRunner.release();
    }
  }

// ####################### || assign rol to user || #######################
  async assignRolesToUser(idUser: number, idRoles: number[]) {
    try {

      if (!idRoles || idRoles.length === 0) {
        return this.responseService.error('Agrega roles para asignar', null, 400);
      }

      const user = await this.userRepository.findOne({
        where: { idUser },
        relations: ['roles', 'roles.menus'],
      });

      if (!user) throw new NotFoundException('Usuario no encontrado');

      const roles = await this.roleRepository.findBy({
        idRoles: In(idRoles),
      });

       if (roles.length !== idRoles.length) {
        return this.responseService.error('Uno o más roles no existen', null, 400);
      }

      user.roles = roles;

      await this.userRepository.save(user);

      return this.responseService.success( 'Rol(es) asignados correctamente al usuario', null, 200,);
    } catch (error) {
      console.log(error);
      return this.responseService.error(error.detail ?? 'Error interno', null, 500);
    }
  }

// ####################### || Delete user || #######################  
  async remove(id: number) {
    try {
      await this.update( id, { active : false } );
      return this.responseService.success('Usuario eliminado correctamente', null, 202);
    } catch (error) {
      return this.responseService.error(error.detail, null, 500);
    }
  }
}