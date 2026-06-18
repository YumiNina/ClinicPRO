import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CitaEstado {
  PENDING = 'pending', //pendiente
  CONFIRMED = 'confirmed', //confirmada
  COMPLETED = 'completed', //completada
  CANCELLED = 'cancelled', //cancelada
  ABSENT = 'absent', // ausente
}

@Entity('citas')
export class Cita {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  paciente_id!: string;

  @Column('uuid')
  medico_id!: string;

  @Column('uuid')
  clinica_id!: string;

  @Column('uuid')
  especialidad_id!: string;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'time' })
  hora!: string;

  @Column({ type: 'text', nullable: true })
  motivo?: string;

  @Column({ type: 'enum', enum: CitaEstado, default: CitaEstado.PENDING })
  estado!: CitaEstado;

  @Column({ type: 'text', nullable: true })
  notas_doctor?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
