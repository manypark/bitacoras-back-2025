import { IsString, IsBoolean, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class CreateConceptDto {
    
  @IsString()
  @IsNotEmpty({ message: 'El nombre del concepto es requerido' })
  @MinLength(4, { message: 'El nombre debe tener al menos 4 caracteres' })
  description: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

