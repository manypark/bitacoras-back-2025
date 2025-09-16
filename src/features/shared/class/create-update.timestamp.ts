import { BeforeInsert, BeforeUpdate, Column } from "typeorm";

export class CreateAndUpdateAt {

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt:Date;

    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
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