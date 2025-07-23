import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsString } from 'class-validator';

export class TaskFilterDto {
  
  @IsInt()
  @Type(() => Number)
  idUserAssigned: number;

  @IsOptional()
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate: string;
}
