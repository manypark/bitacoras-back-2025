import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn } from 'typeorm';

import { Logs } from '../../../features/logs/entities/logs.entity';

@Entity()
export class Concept {
  
  @PrimaryGeneratedColumn()
  idConcept: number;

  @Column({ type: 'varchar', unique:true })
  description: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => Logs, (log) => log.idConcept)
  @JoinColumn({name:'idLog'})
  logs:Logs[];
}
