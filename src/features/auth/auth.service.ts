import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { ResponseService } from '../shared/interceptors';
import { CreateAuthDto, UpdateAuthDto, LoginUserDto, PaginationDto } from './dto';
import { UserResponseMapper } from './mappers/user-response.mapper';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)      
    private readonly userRepository:Repository<User>,
    private readonly responseService:ResponseService,
    private readonly jwtServices:JwtService,
    private readonly dataSource:DataSource,
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

// ####################### || Generate JWT || #######################  
  private getJwtToken( email:string ):string {

    const token = this.jwtServices.sign({ email });

    return token;
  }

// ####################### || Get all users || #######################
  async findAll(  { limit = 10, offset = 0 } : PaginationDto ) {
    try {

      const users = await this.userRepository.find({
        take      : limit, 
        skip      : offset,
        where     : { active:true },
        select    : {
          idUser:true,
          firstName:true,
          lastName:true,
          email:true,
          active:true,
          lastLogin:true,
          avatarUrl:true,
          createdAt:true,
          updatedAt:true
        }
      });

      const usersResponse = users.map( (user) => {
        return  UserResponseMapper.userResponseMapper( user );
      });

      return this.responseService.success('Usuarios cargados correctamente', usersResponse, 202);
      
    } catch (error) {
      return this.responseService.error(error);
    }
  }

// ####################### || Get one user || #######################
  async findOne( idUser:number) {

     try {

      const user = await this.userRepository.findOneBy({ 
        idUser, 
        active:true,
      });

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
