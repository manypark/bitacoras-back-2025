import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { CreateAndUpdateAt } from '../../../features/shared';
import { Logs } from '../../../features/logs/entities/logs.entity';

@Entity()
export class Task extends CreateAndUpdateAt {
  
  @PrimaryGeneratedColumn()
  idTasks: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ManyToOne(() => User, (user) => user.tasksCreated)
  userCreated: User;

  @ManyToOne(() => User, (user) => user.tasksAssigned)
  userAssigned: User;

  @OneToMany(() => Logs, (log) => log.idTasks)
  logs: Logs[];

  @BeforeInsert()
  saveDateTime() {
      this.createdAt = new Date();
      this.updatedAt = new Date();
  }
  
  @BeforeUpdate()
  updateDateTime() {
      this.updatedAt = new Date();
  }

  @BeforeInsert()
  @BeforeUpdate()
  trimTitleAndDescription() {
    this.title = this.title.trim();
    this.description = this.description.trim();
  }

}
