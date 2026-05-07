import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { CitaController } from '../controllers/CitaController';
import { Cita } from '../entities/Cita';
import { Penalizacion } from '../entities/Penalizacion';
import { CitaService } from '../services/CitaService';

const router = Router();

export const initCitaRoutes = (): Router => {
  const citaRepo = AppDataSource.getRepository(Cita);
  const penalizacionRepo = AppDataSource.getRepository(Penalizacion);

  const citaService = new CitaService(citaRepo, penalizacionRepo);
  const citaController = new CitaController(citaService);

  // POST /citas - Agendar nueva cita
  router.post('/', (req, res) => citaController.crearCita(req, res));

  // GET /citas/paciente/:id - Listar citas por paciente
  router.get('/paciente/:id', (req, res) =>
    citaController.obtenerPorPaciente(req, res),
  );

  // GET /citas/medico/:id - Listar citas por medico
  router.get('/medico/:id', (req, res) =>
    citaController.obtenerPorMedico(req, res),
  );

  // PATCH /citas/:id/estado - Cancelar, Completar o Marcar como ausente
  router.patch('/:id/estado', (req, res) =>
    citaController.cambiarEstado(req, res),
  );

  // PATCH /citas/:id/notas - Editar notas del doctor
  router.patch('/:id/notas', (req, res) =>
    citaController.editarNotas(req, res),
  );

  // PUT /citas/:id - Actualizar detalles generales de la cita (fecha, hora, clinica, etc)
  router.put('/:id', (req, res) => citaController.actualizarDetalles(req, res));

  return router;
};

export default router;
