import { BeforeInsert, BeforeUpdate, Column } from "typeorm";

export class CreateAndUpdateAt {

    @Column('timestamp')
    createdAt:Date;

    @Column('timestamp')
    updatedAt:Date;

    @BeforeInsert()
    saveDateTime() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    
    @BeforeUpdate()
    updateDateTime() {
        this.updatedAt = new Date();
    }

}