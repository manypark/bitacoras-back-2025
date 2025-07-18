import { Column } from "typeorm";

export class CreateAndUpdateAt {

    @Column('timestamp')
    createdAt:Date;

    @Column('timestamp')
    updatedAt:Date;

}