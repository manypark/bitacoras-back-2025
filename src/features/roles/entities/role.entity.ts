import { User } from "src/features/auth/entities/user.entity";
import { Menu } from "src/features/menu/entities/menu.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role {

    @PrimaryGeneratedColumn()
    idRoles:number;

    @Column('text', { unique:true })
    name:string;

    @Column('bool', { default:true })
    active:boolean;

    @ManyToMany(() => User, (user) => user.roles)
    users: User[];

    @ManyToMany(() => Menu, (menu) => menu.roles)
    @JoinTable({
        name: 'role_menus',
        joinColumn: {
            name: 'idRole',
            referencedColumnName: 'idRoles',
        },
        inverseJoinColumn: {
            name: 'idMenu',
            referencedColumnName: 'idMenu',
        },
    })
    menus: Menu[];
}