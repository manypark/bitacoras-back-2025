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
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }
    
    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.email = this.email.toLowerCase().trim();
    }
    
}
