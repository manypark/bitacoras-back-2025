import { IsInt, IsNotEmpty } from 'class-validator';
import { User } from 'src/features/auth/entities/user.entity';
import { Menu } from 'src/features/menu/entities/menu.entity';
import { Role } from 'src/features/roles/entities/role.entity';

export class CreateMenuRoleDto {

  @IsInt({ message: 'El idUser debe ser un número entero' })
  @IsNotEmpty({ message: 'El idUser es requerido' })
  idUser:User;

  @IsInt({ message: 'El idMenu debe ser un número entero' })
  @IsNotEmpty({ message: 'El idMenu es requerido' })
  idMenu:Menu;

  @IsInt({ message: 'El idRoles debe ser un número entero' })
  @IsNotEmpty({ message: 'El idRoles es requerido' })
  idRoles:Role;
}
