import * as bcrypt from 'bcrypt';
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { CreateAndUpdateAt } from "src/features/shared";

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
