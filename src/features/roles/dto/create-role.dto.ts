import { IsBoolean, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateRoleDto {

  @IsString()
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  @MinLength(4, { message: 'El nombre debe tener al menos 4 caracteres' })
  name: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
