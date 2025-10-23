import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class TaskFilterDto {
  
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.split(',').map(Number);
    if (Array.isArray(value)) return value.map(Number);
    return [Number(value)];
  })
  @IsArray()
  idUserAssigned: number[];

  @IsOptional()
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate: string;
}
