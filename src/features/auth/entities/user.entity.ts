import * as bcrypt from 'bcrypt';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { CreateAndUpdateAt } from "../../../features/shared";
import { Logs } from '../../../features/logs/entities/logs.entity';
import { Task } from '../../../features/tasks/entities/task.entity';
import { MenuRoles } from '../../../features/menu-roles/entities/menu-role.entity';

@Entity()
export class User extends CreateAndUpdateAt {

    @PrimaryGeneratedColumn()
    idUser:number;

    @Column('text')
    firstName:string;

    @Column('text')
    lastName:string;

    @Column('text', { unique:true })
    email:string;

    @Column('text', { unique:true })
    password?:string;

    @Column('bool', { default:true })
    active:boolean;

    @Column('timestamp')
    lastLogin:Date;

    @Column('text', { default: '' } )
    avatarUrl:string;

    @OneToMany(
        () => MenuRoles,
        (menuRol) => menuRol.idUser,
        { eager:true }
    )
    menuRoles:MenuRoles[];

    @OneToMany(
        () => Logs,
        (logs) => logs.idUser,
    )
    logs:Logs[];

    @OneToMany(() => Task, (task) => task.userCreated)
    tasksCreated: Task[];

    @OneToMany(() => Task, (task) => task.userAssigned)
    tasksAssigned: Task[];

    @BeforeInsert()
    saveDateTime() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.lastLogin = new Date();
    }
    
    @BeforeUpdate()
    updateDateTime() {
        this.updatedAt = new Date();
    }
    
    @BeforeInsert()
    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password && !this.password.startsWith('$2b$')) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }
    
}
