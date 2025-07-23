import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { CreateAndUpdateAt } from "../../../features/shared";
import { User } from "../../../features/auth/entities/user.entity";
import { Task } from "../../../features/tasks/entities/task.entity";
import { Concept } from "../../../features/concepts/entities/concept.entity";

@Entity()
export class Logs extends CreateAndUpdateAt {

  @PrimaryGeneratedColumn()
  idLogs: number;

  @Column({ type: 'varchar', nullable: true, default: '' })
  image_url: string;

  @Column({ type: 'bool', default:true })
  active:boolean;

  @Column({ type: 'varchar', nullable:true, default:'' })
  description?: string;

  @Column({ type: 'double precision' })
  latitud: number;

  @Column({ type: 'double precision' })
  longitud: number;

  @ManyToOne(() => User, (user) => user.logs)
  @JoinColumn({name:'idUser'})
  idUser:User;

  @ManyToOne(() => Task, (task) => task.logs)
  @JoinColumn({name:'idTask'})
  idTasks:Task;

  @ManyToOne(() => Concept, (concept) => concept.logs)
  @JoinColumn({name:'idConcept'})
  idConcept:Concept;

}
