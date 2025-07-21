import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { MenuRoles } from 'src/features/menu-roles/entities/menu-role.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  idMenu: number;

  @Column({unique:true})
  name: string;

  @Column({unique:true})
  route: string;

  @Column()
  icon: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => MenuRoles, (menuRoles) => menuRoles.idMenu)
  menuRoles: MenuRoles[];
}
