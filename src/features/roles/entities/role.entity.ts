import { MenuRoles } from "src/features/menu-roles/entities/menu-role.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role {

    @PrimaryGeneratedColumn()
    idRoles:number;

    @Column('text', { unique:true })
    name:string;

    @Column('bool', { default:true })
    active:boolean;

    @OneToMany(() => MenuRoles, (menuRoles) => menuRoles.idRoles)
    menuRoles: MenuRoles[];

}
