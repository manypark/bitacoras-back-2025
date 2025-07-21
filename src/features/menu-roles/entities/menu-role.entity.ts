import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

import { Menu } from '../../menu/entities/menu.entity';
import { Role } from 'src/features/roles/entities/role.entity';
import { User } from 'src/features/auth/entities/user.entity';

@Entity()
export class MenuRoles {

  @PrimaryGeneratedColumn()
  idMenuRoles: number;

  @ManyToOne(
    () => Menu, 
    (menu) => menu.menuRoles, 
    { eager: true }
  )
  @JoinColumn({ name: 'idMenu' })
  idMenu: Menu;

  @ManyToOne(
    () => Role, 
    (roles) => roles.menuRoles, 
    { eager: true }
  )
  @JoinColumn({ name: 'idRoles' })
  idRoles: Role;

  @ManyToOne(
    () => User, 
    (user) => user.menuRoles,
  )
  @JoinColumn({ name: 'idUser' })
  idUser:User;
  
}
