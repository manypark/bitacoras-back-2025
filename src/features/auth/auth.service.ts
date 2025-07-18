import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ResponseService } from '../shared/interceptors';
import { CreateAuthDto, UpdateAuthDto, LoginUserDto } from './dto';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)      
    private readonly userRepository:Repository<User>,

    private readonly responseService:ResponseService,
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

  async signIn(createAuthDto: LoginUserDto) {
    return 'This action adds a new auth';
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
