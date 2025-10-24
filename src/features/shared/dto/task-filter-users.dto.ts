import { IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class TaskUsersFilterDto {
  
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',').map(Number);
    if (Array.isArray(value)) return value.map(Number);
    return [Number(value)];
  })
  @IsArray()
  idUserAssigned: number[];

  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',').map(Number);
    if (Array.isArray(value)) return value.map(Number);
    return [Number(value)];
  })
  @IsArray()
  idUserCreated: number[];
}