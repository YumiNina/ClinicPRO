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

  @Column('varchar')
  paciente_id!: string;

  @Column('varchar')
  medico_id!: string;

  @Column('varchar')
  clinica_id!: string;

  @Column({ type: 'varchar' })
  especialidad!: string;

  // Formato YYYY-MM-DD
  @Column({ type: 'varchar', length: 10 })
  fecha!: string;

  // Formato HH:mm
  @Column({ type: 'varchar', length: 5 })
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
