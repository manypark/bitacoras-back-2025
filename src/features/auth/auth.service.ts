import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UsersFilterDto } from '../shared';
import { User } from './entities/user.entity';
import { OnlyUserResponseMapper } from './mappers';
import { ResponseService } from '../shared/interceptors';
import { UserResponseMapper } from './mappers/user-response.mapper';
import { CreateAuthDto, UpdateAuthDto, LoginUserDto, PaginationDto } from './dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)      
    private readonly userRepository:Repository<User>,
    private readonly responseService:ResponseService,
    private readonly dataSource:DataSource,
    private readonly jwtServices:JwtService,
  ) {}
  
// ####################### || User Register || #######################
  async signUp(createAuthDto: CreateAuthDto) {
    try {

      const newUser = this.userRepository.create({ ...createAuthDto });

      await this.userRepository.save( newUser );

      return this.responseService.success('Usuario creado correctamente', newUser, 201);

    } catch (error) {
      return this.responseService.error(error.detail, null, 500);
    }
  }

  // ####################### || User Login || #######################
  async signIn({ email, password } : LoginUserDto) {

    try {
      
      const loginUser = await this.userRepository.findOne({ where : { email, active:true } });
  
      if( !loginUser ) return this.responseService.error('Usuario no encontrado o desactivado', null, 404);
  
      if( !bcrypt.compareSync(password, loginUser.password!) ) 
        return this.responseService.error('Usuario o contrasena no coinciden', null, 401);

      const userResponse = UserResponseMapper.userResponseMapper( loginUser );

      const data = {
        token: this.getJwtToken( loginUser.email ),
        ...userResponse,
      };
      
      await this.update( loginUser.idUser, { lastLogin: new Date() } );
  
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
  async findAllUsersFiltered({ limit = 5, offset = 0 }: PaginationDto, { idUsers = [], idRoles = [] }: UsersFilterDto ) {
    try {
      const parsedLimit = Math.max(1, Number(limit) || 5);
      const parsedPage = Math.max(0, Number(offset) || 0);
      const rowOffset = parsedPage * parsedLimit;

      const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.menuRoles', 'menuRoles')
      .leftJoin('menuRoles.idMenu', 'menu')
      .leftJoin('menuRoles.idRoles', 'roles')
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
        'menuRoles.idMenuRoles',
        'menu.idMenu',
        'menu.name',
        'menu.route',
        'menu.icon',
        'roles.idRoles',
        'roles.name',
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
        const menuMap = new Map<number, any>();
        const rolesMap = new Map<number, any>();

        user.menuRoles?.forEach((mr) => {
          if (mr.idMenu) {
            menuMap.set(mr.idMenu.idMenu, {
              idMenu: mr.idMenu.idMenu,
              name: mr.idMenu.name,
              route: mr.idMenu.route,
              icon: mr.idMenu.icon,
            });
          }

          if (mr.idRoles) {
            rolesMap.set(mr.idRoles.idRoles, {
              idRoles: mr.idRoles.idRoles,
              name: mr.idRoles.name,
            });
          }
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
          menuList: Array.from(menuMap.values()),
          rolesList: Array.from(rolesMap.values()),
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
      const user = await this.userRepository.findOneBy({  idUser });

      delete user?.password;

      if( !user ) return this.responseService.error('Usuario no encontrado', null, 404);

      const userResponse = UserResponseMapper.userResponseMapper( user );

      return this.responseService.success('Usuario cargado correctamente', userResponse, 202);
      
    } catch (error) {
     return this.responseService.error(error);
    }
  }

// ####################### || Update one user || #######################
  async update( idUser : number, updateUser : UpdateAuthDto ) {

    const user = await this.userRepository.preload({ idUser:idUser, ...updateUser });

    if( !user ) return this.responseService.error('Usuario no encontrado');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      delete user.password;
      
      return this.responseService.success('Usuario actualizado correctamente', user, 202);
      
    } catch (error) {
      
      await queryRunner.rollbackTransaction();
      return this.responseService.error(error.detail, null, 500);

    } finally {
      await queryRunner.release();
    }
  }

// ####################### || Delete user || #######################  
  async remove(id: number) {
    try {
      await this.update(id, { active : false } );
      return this.responseService.success('Usuario eliminado correctamente', null, 202);
    } catch (error) {
      return this.responseService.error(error.detail, null, 500);
    }
  }
}