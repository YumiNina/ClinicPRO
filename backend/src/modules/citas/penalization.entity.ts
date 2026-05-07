import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoPenalizacion {
  LATE_CANCELLATION = 'late_cancellation',
  MULTIPLE_ABSENCES = 'multiple_absences',
}

@Entity('penalizaciones')
export class Penalizacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar')
  paciente_id!: string;

  @Column({ type: 'enum', enum: TipoPenalizacion })
  tipo!: TipoPenalizacion;

  @Column({ type: 'timestamp' })
  fecha_inicio!: Date;

  @Column({ type: 'timestamp' })
  fecha_fin!: Date;

  @Column({ type: 'boolean', default: true })
  activa!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
