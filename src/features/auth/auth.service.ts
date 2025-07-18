import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateAuthDto, UpdateAuthDto, LoginUserDto } from './dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)      
    private readonly userRepository:Repository<User>,
  ) {}
  
  async signUp(createAuthDto: CreateAuthDto) {
    try {

      const { password, ...userData } = createAuthDto;

      const newUser = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(newUser);

      return { ...userData };

    } catch (error) {
      return new InternalServerErrorException('Internal Server Error');
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
