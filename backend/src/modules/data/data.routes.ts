import { Router } from 'express';
import type { AuthRequest } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { supabase } from '../../config/supabase';

const router = Router();

const allowedTables = {
  pacientes: 'pacientes',
  medicos: 'medicos',
  clinicas: 'clinicas',
  especialidades: 'especialidades',
  logs: 'logs',
} as const;

type AllowedTable = keyof typeof allowedTables;
type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'absent';
type UserRole = 'admin' | 'medico' | 'recepcionista';

const userRoles: UserRole[] = ['admin', 'medico', 'recepcionista'];

const hasCompletedAppointment = async (patientId: string) => {
  const { data } = await supabase
    .from('citas')
    .select('id')
    .eq('paciente_id', patientId)
    .eq('estado', 'completed')
    .limit(1)
    .maybeSingle();

  return Boolean(data);
};

const getReadOnlyRouter = (table: AllowedTable) => {
  const readOnly = Router();
  const tableName = allowedTables[table];

  readOnly.get('/', async (_req, res) => {
    const { data, error } = await supabase.from(tableName).select('*').order('created_at', {
      ascending: false,
    });

    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.json({ success: true, data });
  });

  readOnly.get('/:id', async (req, res) => {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', req.params.id).single();

    if (error) return res.status(404).json({ success: false, message: error.message });
    return res.json({ success: true, data });
  });

  return readOnly;
};

const getPacienteRouter = () => {
  const pacientes = Router();

  pacientes.get('/', async (_req, res) => {
    const { data, error } = await supabase.from('pacientes').select('*').order('created_at', {
      ascending: false,
    });

    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.json({ success: true, data });
  });

  pacientes.get('/:id', async (req, res) => {
    const { data, error } = await supabase.from('pacientes').select('*').eq('id', req.params.id).single();

    if (error) return res.status(404).json({ success: false, message: error.message });
    return res.json({ success: true, data });
  });

  pacientes.post('/', async (req, res) => {
    const { data, error } = await supabase.from('pacientes').insert(req.body).select('*').single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, data });
  });

  pacientes.put('/:id', async (req: AuthRequest, res) => {
    const patientId = String(req.params.id);

    if (req.user?.rol === 'recepcionista' && (await hasCompletedAppointment(patientId))) {
      return res.status(403).json({
        success: false,
        message: 'Recepción no puede editar pacientes que ya fueron atendidos',
      });
    }

    const { data, error } = await supabase
      .from('pacientes')
      .update(req.body)
      .eq('id', patientId)
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.json({ success: true, data });
  });

  pacientes.delete('/:id', authorizeRoles('admin'), async (req, res) => {
    const { error } = await supabase.from('pacientes').delete().eq('id', req.params.id);

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.json({ success: true });
  });

  return pacientes;
};

const getCrudRouter = (table: AllowedTable) => {
  const crud = Router();
  const tableName = allowedTables[table];

  crud.get('/', async (_req, res) => {
    const { data, error } = await supabase.from(tableName).select('*').order('created_at', {
      ascending: false,
    });

    if (error) return res.status(500).json({ success: false, message: error.message });
    return res.json({ success: true, data });
  });

  crud.get('/:id', async (req, res) => {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', req.params.id).single();

    if (error) return res.status(404).json({ success: false, message: error.message });
    return res.json({ success: true, data });
  });

  crud.post('/', async (req, res) => {
    const { data, error } = await supabase.from(tableName).insert(req.body).select('*').single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, data });
  });

  crud.put('/:id', async (req, res) => {
    const { data, error } = await supabase
      .from(tableName)
      .update(req.body)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.json({ success: true, data });
  });

  crud.delete('/:id', async (req, res) => {
    const { error } = await supabase.from(tableName).delete().eq('id', req.params.id);

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.json({ success: true });
  });

  return crud;
};

router.get('/admin/dashboard', authorizeRoles('admin'), async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const [
    pacientes,
    medicos,
    clinicas,
    citasHoy,
    citas,
    logs,
  ] = await Promise.all([
    supabase.from('pacientes').select('id', { count: 'exact', head: true }),
    supabase.from('medicos').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('clinicas').select('id', { count: 'exact', head: true }),
    supabase.from('citas').select('id', { count: 'exact', head: true }).eq('fecha', today),
    supabase.from('citas').select('*').order('created_at', { ascending: false }).limit(8),
    supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(8),
  ]);

  return res.json({
    success: true,
    data: {
      stats: {
        pacientes: pacientes.count || 0,
        medicos: medicos.count || 0,
        clinicas: clinicas.count || 0,
        citasHoy: citasHoy.count || 0,
      },
      recentAppointments: citas.data || [],
      recentActivity: logs.data || [],
    },
  });
});

router.get('/admin/users', authorizeRoles('admin'), async (_req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre_completo, email, rol, activo, ultimo_login, created_at')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, message: error.message });

  const users = data || [];

  return res.json({
    success: true,
    data: {
      users,
      stats: {
        total: users.length,
        activos: users.filter((user) => user.activo).length,
        inactivos: users.filter((user) => !user.activo).length,
        admins: users.filter((user) => user.rol === 'admin').length,
        medicos: users.filter((user) => user.rol === 'medico').length,
        recepcionistas: users.filter((user) => user.rol === 'recepcionista').length,
      },
    },
  });
});

router.patch('/admin/users/:id', authorizeRoles('admin'), async (req: AuthRequest, res) => {
  const userId = String(req.params.id);
  const payload: { rol?: UserRole; activo?: boolean } = {};

  if (req.body.rol !== undefined) {
    if (!userRoles.includes(req.body.rol)) {
      return res.status(400).json({
        success: false,
        message: 'Rol de usuario inválido',
      });
    }

    payload.rol = req.body.rol;
  }

  if (req.body.activo !== undefined) {
    payload.activo = Boolean(req.body.activo);
  }

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No hay cambios para aplicar',
    });
  }

  if (req.user?.id === userId && (payload.activo === false || payload.rol !== undefined)) {
    return res.status(400).json({
      success: false,
      message: 'No puedes cambiar tu propio rol ni desactivar tu cuenta administradora',
    });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .update(payload)
    .eq('id', userId)
    .select('id, nombre_completo, email, rol, activo, ultimo_login, created_at')
    .single();

  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.json({ success: true, data });
});

router.get('/citas', authorizeRoles('admin', 'recepcionista'), async (_req, res) => {
  const { data, error } = await supabase.from('citas').select('*').order('fecha', { ascending: false });
  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json(data || []);
});

router.post('/citas', authorizeRoles('admin', 'recepcionista'), async (req: AuthRequest, res) => {
  const payload = {
    ...req.body,
    estado: req.body.estado || 'pending',
  };

  const { data: activePenalty } = await supabase
    .from('penalizaciones')
    .select('id, fecha_fin')
    .eq('paciente_id', payload.paciente_id)
    .eq('activa', true)
    .gt('fecha_fin', new Date().toISOString())
    .maybeSingle();

  if (activePenalty) {
    return res.status(400).json({
      success: false,
      message: `El paciente tiene una penalizacion activa hasta ${activePenalty.fecha_fin}`,
    });
  }

  const { data: occupiedSlot } = await supabase
    .from('citas')
    .select('id')
    .eq('medico_id', payload.medico_id)
    .eq('fecha', payload.fecha)
    .eq('hora', payload.hora)
    .in('estado', ['pending', 'confirmed'])
    .maybeSingle();

  if (occupiedSlot) {
    return res.status(400).json({
      success: false,
      message: 'El horario seleccionado ya esta ocupado para este medico',
    });
  }

  const { data, error } = await supabase.from('citas').insert(payload).select('*').single();
  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.status(201).json(data);
});

router.get('/citas/paciente/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('paciente_id', req.params.id)
    .order('fecha', { ascending: false });

  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json(data || []);
});

router.get('/citas/medico/:id', async (req, res) => {
  const requestedDoctorId = String(req.params.id);
  const doctorIds = new Set([requestedDoctorId]);

  const { data: linkedDoctor } = await supabase
    .from('medicos')
    .select('id')
    .eq('usuario_id', requestedDoctorId)
    .maybeSingle();

  if (linkedDoctor?.id) {
    doctorIds.add(linkedDoctor.id);
  }

  let query = supabase
    .from('citas')
    .select('*')
    .in('medico_id', Array.from(doctorIds))
    .order('hora');

  if (typeof req.query.fecha === 'string') {
    query = query.eq('fecha', req.query.fecha);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json(data || []);
});

router.patch('/citas/:id/estado', authorizeRoles('admin', 'recepcionista', 'medico'), async (req: AuthRequest, res) => {
  const nextStatus = req.body.estado as AppointmentStatus;

  if (!['pending', 'confirmed', 'completed', 'cancelled', 'absent'].includes(nextStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Estado de cita inválido',
    });
  }

  if (req.user?.rol === 'recepcionista' && !['pending', 'confirmed', 'cancelled'].includes(nextStatus)) {
    return res.status(403).json({
      success: false,
      message: 'Recepción solo puede marcar citas como pendientes, confirmadas o canceladas',
    });
  }

  const { data, error } = await supabase
    .from('citas')
    .update({ estado: nextStatus })
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.json(data);
});

router.patch('/citas/:id/notas', authorizeRoles('medico', 'admin'), async (req, res) => {
  const { data, error } = await supabase
    .from('citas')
    .update({ notas_doctor: req.body.notas_doctor })
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.json(data);
});

router.put('/citas/:id', authorizeRoles('admin', 'recepcionista'), async (req: AuthRequest, res) => {
  if (req.user?.rol === 'recepcionista') {
    const { data: currentAppointment, error: currentAppointmentError } = await supabase
      .from('citas')
      .select('estado')
      .eq('id', req.params.id)
      .single();

    if (currentAppointmentError) {
      return res.status(404).json({ success: false, message: currentAppointmentError.message });
    }

    if (currentAppointment.estado === 'completed') {
      return res.status(403).json({
        success: false,
        message: 'Recepción no puede editar citas ya atendidas',
      });
    }

    const allowedFields = ['paciente_id', 'medico_id', 'clinica_id', 'especialidad', 'fecha', 'hora', 'estado'];
    req.body = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    if (req.body.estado && !['pending', 'confirmed', 'cancelled'].includes(req.body.estado)) {
      return res.status(403).json({
        success: false,
        message: 'Recepción solo puede marcar citas como pendientes, confirmadas o canceladas',
      });
    }
  }

  const { data, error } = await supabase
    .from('citas')
    .update(req.body)
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.json(data);
});

router.delete('/citas/:id', authorizeRoles('admin'), async (req, res) => {
  const { error } = await supabase.from('citas').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.json({ success: true });
});

router.get('/historial/paciente/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('consultas_medicas')
    .select('*')
    .eq('paciente_id', req.params.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json(data || []);
});

router.post('/historial', authorizeRoles('medico', 'admin'), async (req, res) => {
  const { data, error } = await supabase.from('consultas_medicas').insert(req.body).select('*').single();
  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.status(201).json(data);
});

router.use('/pacientes', authorizeRoles('admin', 'recepcionista'), getPacienteRouter());
router.use('/medicos', authorizeRoles('admin'), getCrudRouter('medicos'));
router.use('/clinicas', authorizeRoles('admin'), getCrudRouter('clinicas'));
router.use('/especialidades', authorizeRoles('admin'), getCrudRouter('especialidades'));
router.use('/catalogos/medicos', authorizeRoles('admin', 'recepcionista'), getReadOnlyRouter('medicos'));
router.use('/catalogos/clinicas', authorizeRoles('admin', 'recepcionista'), getReadOnlyRouter('clinicas'));
router.use('/catalogos/especialidades', authorizeRoles('admin', 'recepcionista'), getReadOnlyRouter('especialidades'));
router.use('/logs', authorizeRoles('admin'), getCrudRouter('logs'));

export default router;
