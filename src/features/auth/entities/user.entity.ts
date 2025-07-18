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

    @Column('text', { unique:true, select:false })
    password:string;

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

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }
    
    @BeforeUpdate()
    updateDateTime() {
        this.updatedAt = new Date();
    }
    
    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.email = this.email.toLowerCase().trim();
    }
    
}
