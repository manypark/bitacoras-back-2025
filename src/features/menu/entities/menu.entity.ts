import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

import { Role } from 'src/features/roles/entities/role.entity';

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

  @ManyToMany(() => Role, (role) => role.menus)
  roles: Role[];
}
