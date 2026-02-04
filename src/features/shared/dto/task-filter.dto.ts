import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class TaskFilterDto {
  
  @IsNumber()
  @Transform(({ value }) => Number(value))
  idUserAssigned:number;

  @IsOptional()
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate: string;
}
