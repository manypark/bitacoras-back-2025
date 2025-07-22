import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateTaskDto {

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsInt()
  idUsersCreated: number;

  @IsInt()
  idUserAssigned: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

}
