import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

import { User } from 'src/features/auth/entities/user.entity';

export class CreateTaskDto {

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  userCreated:User;

  @IsInt()
  userAssigned:User;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

}
