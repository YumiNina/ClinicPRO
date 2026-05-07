import { In, MoreThan, type Repository } from 'typeorm';
import { type Cita, CitaEstado } from '../entities/Cita';
import { type Penalizacion, TipoPenalizacion } from '../entities/Penalizacion';

// Dependencia inyectada o obtenida desde AppDataSource en la implementación real
export class CitaService {
  constructor(
    private citaRepo: Repository<Cita>,
    private penalizacionRepo: Repository<Penalizacion>,
  ) {}

  async crearCita(data: Partial<Cita>): Promise<Cita> {
    const ahora = new Date();

    // 1. Validar si tiene una penalización activa
    const penalizacionActiva = await this.penalizacionRepo.findOne({
      where: {
        paciente_id: data.paciente_id,
        activa: true,
        fecha_fin: MoreThan(ahora),
      },
    });

    if (penalizacionActiva) {
      throw new Error(
        `El paciente tiene una penalización activa hasta ${penalizacionActiva.fecha_fin}`,
      );
    }

    // 1.5 Validar cupo ocupado: mismo médico, fecha y hora no puede duplicarse
    const cupoOcupado = await this.citaRepo.findOne({
      where: {
        medico_id: data.medico_id,
        fecha: data.fecha,
        hora: data.hora,
        estado: In([CitaEstado.PENDING, CitaEstado.CONFIRMED]),
      },
    });

    if (cupoOcupado) {
      throw new Error(
        'El horario seleccionado ya esta ocupado para este medico',
      );
    }

    // 2. Validar que no tenga cita para la misma especialidad en la misma fecha
    const citaExistente = await this.citaRepo.findOne({
      where: {
        paciente_id: data.paciente_id,
        especialidad: data.especialidad,
        fecha: data.fecha,
        estado: CitaEstado.PENDING, // Asumiendo que comprobamos solo citas no completadas/canceladas
      },
    });

    if (citaExistente) {
      throw new Error(
        'El paciente ya tiene una cita para esta especialidad en la misma fecha',
      );
    }

    const nuevaCita = this.citaRepo.create(data);
    return await this.citaRepo.save(nuevaCita);
  }

  async listarPorPaciente(paciente_id: string): Promise<Cita[]> {
    return await this.citaRepo.find({
      where: { paciente_id },
      order: { fecha: 'DESC', hora: 'DESC' },
    });
  }

  async listarPorMedico(medico_id: string, fecha?: string): Promise<Cita[]> {
    const whereClause: Record<string, unknown> = { medico_id };
    if (fecha) {
      whereClause.fecha = fecha;
    }
    return await this.citaRepo.find({
      where: whereClause,
      order: { hora: 'ASC' },
    });
  }

  async editarNotas(id: string, notas_doctor: string): Promise<Cita> {
    const cita = await this.citaRepo.findOne({ where: { id } });
    if (!cita) throw new Error('Cita no encontrada');

    cita.notas_doctor = notas_doctor;
    return await this.citaRepo.save(cita);
  }

  async actualizarCita(
    id: string,
    dataModificada: Partial<Cita>,
  ): Promise<Cita> {
    const cita = await this.citaRepo.findOne({ where: { id } });
    if (!cita) throw new Error('Cita no encontrada');

    // No permitimos actualizar el paciente (suele ser inmutable post-creación) o el ID
    const {
      id: _,
      paciente_id,
      created_at,
      ...restoData
    } = dataModificada as Partial<Cita> & Record<string, unknown>;

    Object.assign(cita, restoData);
    return await this.citaRepo.save(cita);
  }

  async cambiarEstado(id: string, nuevoEstado: CitaEstado): Promise<Cita> {
    const cita = await this.citaRepo.findOne({ where: { id } });
    if (!cita) throw new Error('Cita no encontrada');
    const ahora = new Date();

    if (nuevoEstado === CitaEstado.CANCELLED) {
      const fechaCita = new Date(`${cita.fecha}T${cita.hora}:00`);
      const diffMs = fechaCita.getTime() - ahora.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);
      const lateCancellation = diffHoras < 3 && diffHoras > 0;

      // Si la cancelación es con menos de 3 horas de anticipación
      if (lateCancellation) {
        await this.crearPenalizacion(
          cita.paciente_id,
          TipoPenalizacion.LATE_CANCELLATION,
          30,
        );
      }

      await this.registrarCancelacionEnHistorial(cita, lateCancellation);
    }

    if (nuevoEstado === CitaEstado.ABSENT) {
      // Registrar la cita como ausente antes de contar
      cita.estado = CitaEstado.ABSENT;
      await this.citaRepo.save(cita);

      // Revisar si ya tiene 3 ausencias/cancelaciones tardías consecutivas
      const ultimasCitas = await this.citaRepo.find({
        where: { paciente_id: cita.paciente_id },
        order: { fecha: 'DESC', hora: 'DESC' },
        take: 3,
      });

      const ausenciasConsecutivas = ultimasCitas.filter(
        (c) => c.estado === CitaEstado.ABSENT,
      ).length;
      if (ausenciasConsecutivas >= 3) {
        await this.crearPenalizacion(
          cita.paciente_id,
          TipoPenalizacion.MULTIPLE_ABSENCES,
          365,
        ); // 1 año
      }
    } else {
      cita.estado = nuevoEstado;
      await this.citaRepo.save(cita);
    }
    return cita;
  }

  private async crearPenalizacion(
    paciente_id: string,
    tipo: TipoPenalizacion,
    dias: number,
  ) {
    const ahora = new Date();
    const fechaFin = new Date();
    fechaFin.setDate(ahora.getDate() + dias);

    const penalizacion = this.penalizacionRepo.create({
      paciente_id,
      tipo,
      fecha_inicio: ahora,
      fecha_fin: fechaFin,
      activa: true,
    });

    await this.penalizacionRepo.save(penalizacion);
  }

  private async registrarCancelacionEnHistorial(
    cita: Cita,
    lateCancellation: boolean,
  ): Promise<void> {
    const historialApiBase =
      process.env.HISTORIAL_API_URL || 'http://historial-service:3002/api';

    const payload = {
      paciente_id: cita.paciente_id,
      diagnostico: 'Cita cancelada',
      severidad: lateCancellation ? 'moderado' : 'leve',
      medico_encargado: cita.medico_id,
      descripcion: `Cancelacion de cita de ${cita.especialidad} para ${cita.fecha} a las ${cita.hora}.`,
      tratamiento: 'Sin tratamiento por cancelacion',
      proxima_cita: cita.fecha,
    };

    try {
      const response = await fetch(`${historialApiBase}/historial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          'No se pudo registrar cancelacion en historial:',
          errorBody,
        );
      }
    } catch (error) {
      console.error('Error enviando cancelacion a historial-service:', error);
    }
  }
}
