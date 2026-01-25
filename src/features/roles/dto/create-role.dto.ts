import { IsBoolean, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

import { AssignMenuToRoleDto } from './assign-menu-to-role.dto';

export class CreateRoleDto extends AssignMenuToRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del rol es requerido' })
  @MinLength(4, { message: 'El nombre debe tener al menos 4 caracteres' })
  name: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}