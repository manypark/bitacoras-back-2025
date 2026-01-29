import * as bcrypt from 'bcrypt';
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { CreateAndUpdateAt } from "../../../features/shared";
import { Role } from 'src/features/roles/entities/role.entity';
import { Logs } from '../../../features/logs/entities/logs.entity';
import { Task } from '../../../features/tasks/entities/task.entity';

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
    avatarUrl?:string;

    @ManyToMany(() => Role, (role) => role.users)
    @JoinTable({
        name: 'user_roles',
        joinColumn: {
            name: 'idUser',
            referencedColumnName: 'idUser',
        },
        inverseJoinColumn: {
            name: 'idRole',
            referencedColumnName: 'idRoles',
        },
    })
    roles: Role[];

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
    setLastLogin() {
        this.lastLogin = new Date();
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
