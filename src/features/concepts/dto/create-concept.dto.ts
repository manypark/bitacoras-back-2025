import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateConceptDto {
    
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

