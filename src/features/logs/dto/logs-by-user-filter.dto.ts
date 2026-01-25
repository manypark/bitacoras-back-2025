// logs-filter.dto.ts
import { IsArray, IsDateString, IsOptional } from 'class-validator';

export class LogsFilterDto {
  @IsOptional()
  @IsArray()
  userIds?: number[];

  @IsOptional()
  @IsDateString()
  date?: string;
}