import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ResponseService } from '../shared/interceptors';
import { CreateAuthDto, UpdateAuthDto, LoginUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)      
    private readonly userRepository:Repository<User>,
    private readonly responseService:ResponseService,
    private readonly jwtServices:JwtService,
  ) {}
  
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
      return this.responseService.error(error.detail);
    }
  }

  async signIn({ email, password } : LoginUserDto) {

    const loginUser = await this.userRepository.findOne({
      where : { email },
      select: { email : true, password : true, idUser: true },
    });

    if( !loginUser ) return this.responseService.error('Usuario no encontrado');

    if( !bcrypt.compareSync(password, loginUser.password) ) return this.responseService.error('Usuario o contrasena no coinciden');

    const data = {
      ...loginUser,
      token: this.getJwtToken( loginUser.idUser ),
    };

    return this.responseService.success('Usuario loguedo correctamente', data, 202);
  }

  private getJwtToken( idUser:number ):string {

    const token = this.jwtServices.sign({ idUser : idUser });

    return token;
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
