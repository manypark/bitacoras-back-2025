import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { ResponseService } from '../shared/interceptors';
import { CreateAuthDto, UpdateAuthDto, LoginUserDto, PaginationDto } from './dto';


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

      const { password, ...userData } = createAuthDto;

      const newUser = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save( newUser );

      return this.responseService.success('Usuario creado correctamente', userData, 201);

    } catch (error) {
      return this.responseService.error(error.detail, null, 500);
    }
  }

  // ####################### || User Login || #######################
  async signIn({ email, password } : LoginUserDto) {

    const loginUser = await this.userRepository.findOne({
      where : { email },
      select: { email : true, password : true, idUser: true },
    });

    if( !loginUser ) return this.responseService.error('Usuario no encontrado', null, 404);

    if( !bcrypt.compareSync(password, loginUser.password) ) 
      return this.responseService.error('Usuario o contrasena no coinciden', null, 401);

    const data = {
      ...loginUser,
      token: this.getJwtToken( loginUser.idUser ),
    };

    return this.responseService.success('Usuario loguedo correctamente', data, 202);
  }

// ####################### || Generate JWT || #######################  
  private getJwtToken( idUser:number ):string {

    const token = this.jwtServices.sign({ idUser : idUser });

    return token;
  }

// ####################### || Get all users || #######################
  async findAll(  { limit = 10, offset = 0 } : PaginationDto ) {
    try {

      const users = await this.userRepository.find({
        take      : limit, 
        skip      : offset,
        where     : { active:true }
      });

      return this.responseService.success('Usuarios cargados correctamente', users, 202);
      
    } catch (error) {
      return this.responseService.error(error);
    }
  }

// ####################### || Get one user || #######################
  async findOne( idUser:number) {
     try {

      const user = await this.userRepository.findOneBy({ idUser, active:true });

      if( !user ) return this.responseService.error('Usuario no encontrado', null, 404);

      return this.responseService.success('Usuario cargado correctamente', user, 202);
      
    } catch (error) {
     return this.responseService.error(error);
    }
  }

// ####################### || Update one user || #######################
  async update( idUser : number, updateUser : UpdateAuthDto) {

    const user = await this.userRepository.preload({ idUser:idUser, ...updateUser });

    if( !user ) return this.responseService.error('Usuario no encontrado');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      
       const newUser = this.userRepository.create({
        ...user,
        password: bcrypt.hashSync(user.password, 10),
      });

      await queryRunner.manager.save(newUser);
      await queryRunner.commitTransaction();

      return this.responseService.success('Usuario actualizado correctamente', newUser, 202);
      
    } catch (error) {
      
      await queryRunner.rollbackTransaction();
      return this.responseService.error(error.detail, null, 500);

    } finally {
      await queryRunner.release();
    }
  }

// ####################### || Delete user || #######################  
  async remove(id: number) {
    return `This action removes a #${id} auth`;
  }

}
