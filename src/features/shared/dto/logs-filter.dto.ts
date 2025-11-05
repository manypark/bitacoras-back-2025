import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class LogsFilterDto {
  
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
  @IsOptional()
  idConcepts?: number[];

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  limit?: number = 5;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  offset?: number = 0;
}