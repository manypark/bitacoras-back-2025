// logs-filter.dto.ts
import { IsArray, IsDateString, IsOptional } from 'class-validator';

export class LogsFilterDto {
  @IsOptional()
  @IsArray()
  userIds?: number[];   // ej: [1, 3, 8]

  @IsOptional()
  @IsDateString()
  date?: string;        // ej: "2025-02-14"
}