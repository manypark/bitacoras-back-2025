import { IsArray, ArrayNotEmpty, IsInt, IsNotEmpty } from 'class-validator';

export class CreateMenuRoleDto {
  @IsInt({ message: 'El idUser debe ser un número entero' })
  @IsNotEmpty({ message: 'El idUser es requerido' })
  idUser: number;

  @IsArray({ message: 'idMenu debe ser un arreglo' })
  @ArrayNotEmpty({ message: 'idMenu no puede estar vacío' })
  @IsInt({ each: true, message: 'Cada idMenu debe ser un número entero' })
  idMenu: number[];

  @IsArray({ message: 'idRoles debe ser un arreglo' })
  @ArrayNotEmpty({ message: 'idRoles no puede estar vacío' })
  @IsInt({ each: true, message: 'Cada idRoles debe ser un número entero' })
  idRoles: number[];
}