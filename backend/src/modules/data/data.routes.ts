import { Router, type Response } from 'express';
import { authService } from '../auth/auth.service';
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
const lettersRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s.'-]+$/;
const digitsRegex = /^\d+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const licenseRegex = /^[A-Za-z0-9-]{4,30}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const timeRangeRegex = /^([01]?\d|2[0-3]):[0-5]\d\s*-\s*([01]?\d|2[0-3]):[0-5]\d$/;

type AnyPayload = Record<string, unknown>;

const normalizeValue = (value: unknown) => String(value ?? '').trim();
const normalizeEmail = (value: unknown) => normalizeValue(value).toLowerCase();
const todayIso = () => new Date().toISOString().slice(0, 10);
const currentYearEndIso = () => `${new Date().getFullYear()}-12-31`;
const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isLetters = (value: unknown, minLength = 3) => {
  const normalized = normalizeValue(value);
  return normalized.length >= minLength && lettersRegex.test(normalized);
};
const isDigits = (value: unknown, minLength = 5, maxLength = 15) => {
  const normalized = normalizeValue(value);
  return (
    normalized.length >= minLength &&
    normalized.length <= maxLength &&
    digitsRegex.test(normalized)
  );
};
const isPhone = (value: unknown) => isDigits(value, 7, 12);
const isEmail = (value: unknown) => emailRegex.test(normalizeValue(value));
const isDateNotFuture = (value: unknown) => {
  const normalized = normalizeValue(value);
  return isIsoDate(normalized) && normalized <= todayIso();
};
const isAppointmentDateAllowed = (value: unknown) => {
  const normalized = normalizeValue(value);
  return isIsoDate(normalized) && normalized >= todayIso() && normalized <= currentYearEndIso();
};
const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};
const isTimeRangeSchedule = (value: unknown) => {
  const normalized = normalizeValue(value);
  if (!normalized) return false;

  return normalized.split(',').every((range) => {
    const match = range.trim().match(timeRangeRegex);
    if (!match) return false;

    const [start, end] = range.split('-').map((part) => part.trim());
    return toMinutes(start) < toMinutes(end);
  });
};
const appToDbAppointmentStatus: Record<string, string> = {
  pending: 'pending',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
  absent: 'absent',
  pendiente: 'pending',
  confirmada: 'confirmed',
  completada: 'completed',
  cancelada: 'cancelled',
  no_asistio: 'absent',
};
const dbToAppAppointmentStatus: Record<string, AppointmentStatus> = {
  pendiente: 'pending',
  confirmada: 'confirmed',
  completada: 'completed',
  cancelada: 'cancelled',
  no_asistio: 'absent',
};
const toDbAppointmentStatus = (value: unknown) => {
  const normalized = normalizeValue(value);
  return appToDbAppointmentStatus[normalized] || normalized;
};
const toAppAppointmentStatus = (value: unknown) => {
  const normalized = normalizeValue(value);
  return dbToAppAppointmentStatus[normalized] || (normalized as AppointmentStatus);
};
const mapCitaFromDb = <T extends { estado?: unknown }>(appointment: T) => ({
  ...appointment,
  estado: toAppAppointmentStatus(appointment.estado),
});
const mapCitasFromDb = <T extends { estado?: unknown }>(appointments: T[] = []) =>
  appointments.map(mapCitaFromDb);
const asArray = <T>(value: T[] | null | undefined) => value || [];
const getDoctorIdsForUser = async (userId: string, email?: string) => {
  const doctorIds = new Set([normalizeValue(userId)]);

  const { data: linkedDoctor } = await supabase
    .from('medicos')
    .select('id')
    .eq('usuario_id', userId)
    .maybeSingle();

  if (linkedDoctor?.id) {
    doctorIds.add(normalizeValue(linkedDoctor.id));
  }

  if (email) {
    const { data: doctorByEmail } = await supabase
      .from('medicos')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    if (doctorByEmail?.id) {
      doctorIds.add(normalizeValue(doctorByEmail.id));
    }
  }

  return Array.from(doctorIds).filter(Boolean);
};

const formatDateTime = (value?: unknown) => {
  const dateValue = normalizeValue(value);
  if (!dateValue) return new Date(0).getTime();
  return new Date(dateValue).getTime();
};

const sortByCreatedAtDesc = <T extends { created_at?: unknown }>(items: T[]) =>
  [...items].sort((a, b) => formatDateTime(b.created_at) - formatDateTime(a.created_at));

const appointmentDateTime = (appointment: AnyPayload) =>
  normalizeValue(appointment.created_at) ||
  `${normalizeValue(appointment.fecha)}T${normalizeValue(appointment.hora || '00:00')}:00`;

const getPatientLabel = (patient: AnyPayload | undefined, fallback: unknown) =>
  normalizeValue(patient?.nombre_completo || patient?.nombre_apellido || fallback || 'Paciente sin nombre');

const getDoctorLabel = (doctor: AnyPayload | undefined, fallback: unknown) =>
  normalizeValue(doctor?.nombre_completo || fallback || 'Médico sin nombre');

const getClinicLabel = (clinic: AnyPayload | undefined, fallback: unknown) =>
  normalizeValue(clinic?.nombre || fallback || 'Clínica sin nombre');

const buildLookup = <T extends { id?: unknown }>(items: T[]) =>
  new Map(items.map((item) => [normalizeValue(item.id), item]));

const buildActivity = (
  patients: AnyPayload[],
  doctors: AnyPayload[],
  clinics: AnyPayload[],
  users: AnyPayload[],
  appointments: AnyPayload[],
  patientLookup = buildLookup(patients),
  doctorLookup = buildLookup(doctors),
  clinicLookup = buildLookup(clinics)
) => {
  const patientActivities = patients.map((patient) => ({
    id: `patient-${normalizeValue(patient.id)}`,
    type: 'patient',
    title: 'Nuevo paciente registrado',
    message: `${getPatientLabel(patient, patient.id)} fue registrado en Clinic Pro.`,
    created_at: normalizeValue(patient.created_at),
  }));

  const doctorActivities = doctors.map((doctor) => ({
    id: `doctor-${normalizeValue(doctor.id)}`,
    type: 'doctor',
    title: 'Nuevo médico registrado',
    message: `${getDoctorLabel(doctor, doctor.id)} fue agregado al directorio médico.`,
    created_at: normalizeValue(doctor.created_at),
  }));

  const clinicActivities = clinics.map((clinic) => ({
    id: `clinic-${normalizeValue(clinic.id)}`,
    type: 'clinic',
    title: 'Nueva clínica registrada',
    message: `${getClinicLabel(clinic, clinic.id)} fue agregada al sistema.`,
    created_at: normalizeValue(clinic.created_at),
  }));

  const userActivities = users.map((user) => ({
    id: `user-${normalizeValue(user.id)}`,
    type: 'user',
    title: 'Nuevo usuario registrado',
    message: `${normalizeValue(user.nombre_completo || user.email)} fue registrado como ${normalizeValue(user.rol)}.`,
    created_at: normalizeValue(user.created_at),
  }));

  const appointmentActivities = appointments.map((appointment) => ({
    id: `appointment-${normalizeValue(appointment.id)}`,
    type: 'appointment',
    title: 'Cita registrada',
    message: `${getPatientLabel(patientLookup.get(normalizeValue(appointment.paciente_id)), appointment.paciente_id)} tiene cita de ${normalizeValue(appointment.especialidad)} con ${getDoctorLabel(doctorLookup.get(normalizeValue(appointment.medico_id)), appointment.medico_id)} en ${getClinicLabel(clinicLookup.get(normalizeValue(appointment.clinica_id)), appointment.clinica_id)}.`,
    created_at: appointmentDateTime(appointment),
  }));

  return sortByCreatedAtDesc([
    ...patientActivities,
    ...doctorActivities,
    ...clinicActivities,
    ...userActivities,
    ...appointmentActivities,
  ]).slice(0, 12);
};

const validatePacientePayload = (body: AnyPayload, partial = false) => {
  if ((!partial || body.nombre_completo !== undefined) && !isLetters(body.nombre_completo)) {
    return 'El nombre del paciente debe contener solo letras';
  }

  if ((!partial || body.ci !== undefined) && !isDigits(body.ci, 5, 12)) {
    return 'El CI del paciente debe contener solo números, entre 5 y 12 dígitos';
  }

  if ((!partial || body.fecha_nacimiento !== undefined) && !isDateNotFuture(body.fecha_nacimiento)) {
    return 'La fecha de nacimiento no puede ser futura';
  }

  if ((!partial || body.telefono !== undefined) && !isPhone(body.telefono)) {
    return 'El teléfono del paciente debe contener solo números, entre 7 y 12 dígitos';
  }

  if ((!partial || body.email !== undefined) && !isEmail(body.email)) {
    return 'El correo del paciente no tiene un formato válido';
  }

  return null;
};

const validateHistorialPayload = (body: AnyPayload, partial = false) => {
  if ((!partial || body.paciente_id !== undefined) && !normalizeValue(body.paciente_id)) {
    return 'Selecciona un paciente válido';
  }

  if ((!partial || body.diagnostico !== undefined) && normalizeValue(body.diagnostico).length < 3) {
    return 'El diagnóstico debe tener al menos 3 caracteres';
  }

  if (
    body.severidad !== undefined &&
    body.severidad !== '' &&
    !['BAJA', 'MEDIA', 'ALTA', 'CRITICA'].includes(normalizeValue(body.severidad))
  ) {
    return 'La severidad del historial no es válida';
  }

  if (body.proxima_cita && !isAppointmentDateAllowed(body.proxima_cita)) {
    return 'La próxima cita debe estar dentro del año actual y no puede ser pasada';
  }

  return null;
};

const validateClinicaPayload = (body: AnyPayload, partial = false) => {
  if ((!partial || body.nombre !== undefined) && normalizeValue(body.nombre).length < 3) {
    return 'El nombre de la clínica debe tener al menos 3 caracteres';
  }

  if ((!partial || body.ciudad !== undefined) && !isLetters(body.ciudad, 2)) {
    return 'La ciudad debe contener solo letras';
  }

  if ((!partial || body.telefono !== undefined) && !isPhone(body.telefono)) {
    return 'El teléfono de la clínica debe contener solo números, entre 7 y 12 dígitos';
  }

  if ((!partial || body.email !== undefined) && !isEmail(body.email)) {
    return 'El correo de la clínica no tiene un formato válido';
  }

  return null;
};

const validateMedicoPayload = (body: AnyPayload, partial = false) => {
  if ((!partial || body.nombre_completo !== undefined) && !isLetters(body.nombre_completo)) {
    return 'El nombre del médico debe contener solo letras';
  }

  if ((!partial || body.ci !== undefined) && !isDigits(body.ci, 5, 12)) {
    return 'El CI del médico debe contener solo números, entre 5 y 12 dígitos';
  }

  if ((!partial || body.email !== undefined) && !isEmail(body.email)) {
    return 'El correo del médico no tiene un formato válido';
  }

  if ((!partial || body.telefono !== undefined) && !isPhone(body.telefono)) {
    return 'El teléfono del médico debe contener solo números, entre 7 y 12 dígitos';
  }

  if ((!partial || body.especialidad !== undefined) && normalizeValue(body.especialidad).length < 3) {
    return 'Selecciona una especialidad válida';
  }

  if ((!partial || body.licencia_medica !== undefined) && !licenseRegex.test(normalizeValue(body.licencia_medica))) {
    return 'La licencia médica debe tener entre 4 y 30 caracteres alfanuméricos';
  }

  if ((!partial || body.horario !== undefined) && !isTimeRangeSchedule(body.horario)) {
    return 'El horario debe usar solo horas, por ejemplo 09:00-12:00 o 09:00-12:00, 14:00-18:00';
  }

  return null;
};

const validateCrudPayload = (table: AllowedTable, body: AnyPayload, partial = false) => {
  if (table === 'medicos') return validateMedicoPayload(body, partial);
  if (table === 'clinicas') return validateClinicaPayload(body, partial);
  return null;
};

const pickPayload = (body: AnyPayload, fields: string[]) =>
  Object.fromEntries(
    fields
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field]])
  );

const normalizePacientePayload = (body: AnyPayload) =>
  ({
    ...pickPayload(body, [
      'usuario_id',
      'nombre_completo',
      'ci',
      'telefono',
      'email',
      'fecha_nacimiento',
      'direccion',
    ]),
    ...(body.nombre_completo !== undefined ? { nombre_apellido: body.nombre_completo } : {}),
    ...(body.ci !== undefined ? { dni_nie: body.ci } : {}),
  });

const normalizeCitaPayload = (body: AnyPayload) => ({
  ...pickPayload(body, [
    'paciente_id',
    'medico_id',
    'clinica_id',
    'especialidad',
    'fecha',
    'hora',
    'motivo',
    'estado',
    'notas_doctor',
  ]),
  ...(body.estado !== undefined ? { estado: toDbAppointmentStatus(body.estado) } : {}),
  ...(body.fecha !== undefined && body.hora !== undefined
    ? { fecha_hora: `${normalizeValue(body.fecha)}T${normalizeValue(body.hora)}:00` }
    : {}),
});

const normalizeHistorialPayload = (body: AnyPayload) => ({
  ...pickPayload(body, [
    'paciente_id',
    'diagnostico',
    'severidad',
    'medico_encargado',
    'descripcion',
    'tratamiento',
    'proxima_cita',
  ]),
  updated_at: new Date().toISOString(),
});

const normalizeCrudPayload = (table: AllowedTable, body: AnyPayload) => {
  if (table === 'medicos') {
    return pickPayload(body, [
      'usuario_id',
      'nombre_completo',
      'ci',
      'email',
      'telefono',
      'especialidad',
      'licencia_medica',
      'clinica_id',
      'horario',
      'activo',
    ]);
  }

  if (table === 'clinicas') {
    return pickPayload(body, [
      'nombre',
      'direccion',
      'ciudad',
      'telefono',
      'email',
      'horario',
      'descripcion',
    ]);
  }

  if (table === 'especialidades') {
    return pickPayload(body, ['nombre', 'descripcion']);
  }

  if (table === 'logs') {
    return pickPayload(body, ['usuario_id', 'accion', 'entidad', 'entidad_id', 'detalle']);
  }

  return body;
};

const firstByEmail = async (table: 'usuarios' | 'medicos', email: string) => {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .ilike('email', email)
    .limit(1);

  if (error) throw error;

  return data?.[0] || null;
};

const hasCompletedAppointment = async (patientId: string) => {
  const { data } = await supabase
    .from('citas')
    .select('id')
    .eq('paciente_id', patientId)
    .in('estado', ['completed', 'completada'])
    .limit(1)
    .maybeSingle();

  return Boolean(data);
};

const doctorCanAccessAppointment = async (user: AuthRequest['user'], appointmentId: string) => {
  if (user?.rol !== 'medico') return true;

  const doctorIds = await getDoctorIdsForUser(normalizeValue(user.id), normalizeValue(user.email));
  const { data: appointment } = await supabase
    .from('citas')
    .select('medico_id')
    .eq('id', appointmentId)
    .maybeSingle();

  return Boolean(appointment && doctorIds.includes(normalizeValue(appointment.medico_id)));
};

const resolveDoctorUserIdForAppointment = async (doctorId: unknown) => {
  const normalizedDoctorId = normalizeValue(doctorId);

  if (!normalizedDoctorId) return null;

  const { data: userDoctor } = await supabase
    .from('usuarios')
    .select('id')
    .eq('id', normalizedDoctorId)
    .eq('rol', 'medico')
    .maybeSingle();

  if (userDoctor?.id) return normalizeValue(userDoctor.id);

  const { data: doctorRecord } = await supabase
    .from('medicos')
    .select('usuario_id,email')
    .eq('id', normalizedDoctorId)
    .maybeSingle();

  if (doctorRecord?.usuario_id) return normalizeValue(doctorRecord.usuario_id);

  if (doctorRecord?.email) {
    const { data: userByEmail } = await supabase
      .from('usuarios')
      .select('id')
      .ilike('email', doctorRecord.email)
      .eq('rol', 'medico')
      .maybeSingle();

    if (userByEmail?.id) return normalizeValue(userByEmail.id);
  }

  return null;
};

const rejectIfDoctorCannotAccessAppointment = async (
  req: AuthRequest,
  res: Response
) => {
  if (req.user?.rol !== 'medico') return false;

  const canAccess = await doctorCanAccessAppointment(req.user, normalizeValue(req.params.id));

  if (!canAccess) {
    res.status(403).json({
      success: false,
      message: 'No tienes permiso para modificar una cita de otro médico',
    });
    return true;
  }

  return false;
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
    const validationError = validatePacientePayload(req.body);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const { data, error } = await supabase
      .from('pacientes')
      .insert(normalizePacientePayload(req.body))
      .select('*')
      .single();

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

    const validationError = validatePacientePayload(req.body, true);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const { data, error } = await supabase
      .from('pacientes')
      .update(normalizePacientePayload(req.body))
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
    const validationError = validateCrudPayload(table, req.body);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const { data, error } = await supabase
      .from(tableName)
      .insert(normalizeCrudPayload(table, req.body))
      .select('*')
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    return res.status(201).json({ success: true, data });
  });

  crud.put('/:id', async (req, res) => {
    const validationError = validateCrudPayload(table, req.body, true);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const { data, error } = await supabase
      .from(tableName)
      .update(normalizeCrudPayload(table, req.body))
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
    patientsCount,
    doctorsCount,
    clinicsCount,
    appointmentsTodayCount,
    usersCount,
    patients,
    doctors,
    clinics,
    appointmentsToday,
    appointments,
    users,
  ] = await Promise.all([
    supabase.from('pacientes').select('id', { count: 'exact', head: true }),
    supabase.from('medicos').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('clinicas').select('id', { count: 'exact', head: true }),
    supabase.from('citas').select('id', { count: 'exact', head: true }).eq('fecha', today),
    supabase.from('usuarios').select('id', { count: 'exact', head: true }),
    supabase
      .from('pacientes')
      .select('id,nombre_completo,nombre_apellido,ci,dni_nie,telefono,email,created_at')
      .order('created_at', { ascending: false })
      .limit(25),
    supabase
      .from('medicos')
      .select('id,nombre_completo,email,telefono,especialidad,licencia_medica,clinica_id,activo,created_at')
      .order('created_at', { ascending: false })
      .limit(25),
    supabase
      .from('clinicas')
      .select('id,nombre,ciudad,telefono,email,created_at')
      .order('created_at', { ascending: false })
      .limit(25),
    supabase
      .from('citas')
      .select('*')
      .eq('fecha', today)
      .order('hora', { ascending: true })
      .limit(25),
    supabase.from('citas').select('*').order('created_at', { ascending: false }).limit(25),
    supabase
      .from('usuarios')
      .select('id,nombre_completo,email,rol,activo,ultimo_login,created_at')
      .order('created_at', { ascending: false })
      .limit(25),
  ]);

  const patientRows = asArray(patients.data);
  const doctorRows = asArray(doctors.data);
  const clinicRows = asArray(clinics.data);
  const appointmentRows = mapCitasFromDb(asArray(appointments.data));
  const appointmentTodayRows = mapCitasFromDb(asArray(appointmentsToday.data));
  const userRows = asArray(users.data);

  return res.json({
    success: true,
    data: {
      stats: {
        pacientes: patientsCount.count || 0,
        medicos: doctorsCount.count || 0,
        clinicas: clinicsCount.count || 0,
        citasHoy: appointmentsTodayCount.count || 0,
        usuarios: usersCount.count || 0,
      },
      reports: {
        pacientes: patientRows,
        medicos: doctorRows,
        clinicas: clinicRows,
        citasHoy: appointmentTodayRows,
        citas: appointmentRows,
        usuarios: userRows,
      },
      recentActivity: buildActivity(
        patientRows,
        doctorRows,
        clinicRows,
        userRows,
        appointmentRows
      ),
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

router.get('/reception/dashboard', authorizeRoles('recepcionista'), async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const [
    patientsCount,
    appointmentsCount,
    appointmentsTodayCount,
    pendingAppointmentsCount,
    patients,
    appointments,
    appointmentsToday,
    doctors,
    clinics,
  ] = await Promise.all([
    supabase.from('pacientes').select('id', { count: 'exact', head: true }),
    supabase.from('citas').select('id', { count: 'exact', head: true }),
    supabase.from('citas').select('id', { count: 'exact', head: true }).eq('fecha', today),
    supabase.from('citas').select('id', { count: 'exact', head: true }).in('estado', ['pending', 'confirmed']),
    supabase
      .from('pacientes')
      .select('id,nombre_completo,nombre_apellido,ci,dni_nie,telefono,email,created_at')
      .order('created_at', { ascending: false })
      .limit(25),
    supabase.from('citas').select('*').order('created_at', { ascending: false }).limit(25),
    supabase.from('citas').select('*').eq('fecha', today).order('hora', { ascending: true }).limit(25),
    supabase.from('medicos').select('id,nombre_completo,especialidad,created_at').limit(50),
    supabase.from('clinicas').select('id,nombre,created_at').limit(50),
  ]);

  const patientRows = asArray(patients.data);
  const doctorRows = asArray(doctors.data);
  const clinicRows = asArray(clinics.data);
  const appointmentRows = mapCitasFromDb(asArray(appointments.data));
  const appointmentTodayRows = mapCitasFromDb(asArray(appointmentsToday.data));

  return res.json({
    success: true,
    data: {
      stats: {
        pacientes: patientsCount.count || 0,
        citasRegistradas: appointmentsCount.count || 0,
        citasHoy: appointmentsTodayCount.count || 0,
        citasPendientes: pendingAppointmentsCount.count || 0,
      },
      reports: {
        pacientes: patientRows,
        citas: appointmentRows,
        citasHoy: appointmentTodayRows,
        citasPendientes: appointmentRows.filter((appointment) =>
          ['pending', 'confirmed'].includes(normalizeValue(appointment.estado))
        ),
      },
      recentActivity: buildActivity(patientRows, [], [], [], appointmentRows, undefined, buildLookup(doctorRows), buildLookup(clinicRows)),
    },
  });
});

router.get('/doctor/dashboard', authorizeRoles('medico'), async (req: AuthRequest, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const userId = normalizeValue(req.user?.id);
  const doctorIds = await getDoctorIdsForUser(userId, normalizeValue(req.user?.email));

  const { data: appointments, error: appointmentsError } = await supabase
    .from('citas')
    .select('*')
    .in('medico_id', doctorIds)
    .order('fecha', { ascending: false })
    .order('hora', { ascending: true })
    .limit(50);

  if (appointmentsError) {
    return res.status(500).json({ success: false, message: appointmentsError.message });
  }

  const appointmentRows = mapCitasFromDb(asArray(appointments));
  const patientIds = Array.from(new Set(appointmentRows.map((appointment) => normalizeValue(appointment.paciente_id)).filter(Boolean)));

  const [{ data: patients }, { data: histories }] = await Promise.all([
    patientIds.length > 0
      ? supabase
          .from('pacientes')
          .select('id,nombre_completo,nombre_apellido,ci,dni_nie,telefono,email,created_at')
          .in('id', patientIds)
      : Promise.resolve({ data: [] as AnyPayload[] }),
    patientIds.length > 0
      ? supabase
          .from('consultas_medicas')
          .select('*')
          .in('paciente_id', patientIds)
          .order('created_at', { ascending: false })
          .limit(25)
      : Promise.resolve({ data: [] as AnyPayload[] }),
  ]);

  const patientRows = asArray(patients as AnyPayload[] | null);
  const historyRows = asArray(histories as AnyPayload[] | null);
  const patientLookup = buildLookup(patientRows);
  const todayAppointments = appointmentRows.filter((appointment) => normalizeValue(appointment.fecha) === today);
  const recentActivity = [
    ...buildActivity(patientRows, [], [], [], appointmentRows, patientLookup),
    ...historyRows.map((history) => ({
      id: `history-${normalizeValue(history.id)}`,
      type: 'history',
      title: 'Historial médico actualizado',
      message: `${getPatientLabel(patientLookup.get(normalizeValue(history.paciente_id)), history.paciente_id)} tiene una consulta registrada: ${normalizeValue(history.diagnostico || 'sin diagnóstico')}.`,
      created_at: normalizeValue(history.created_at),
    })),
  ]
    .sort((a, b) => formatDateTime(b.created_at) - formatDateTime(a.created_at))
    .slice(0, 12);

  return res.json({
    success: true,
    data: {
      stats: {
        citasHoy: todayAppointments.length,
        citasRegistradas: appointmentRows.length,
        pacientes: patientRows.length,
        historiales: historyRows.length,
      },
      reports: {
        citasHoy: todayAppointments,
        citas: appointmentRows,
        pacientes: patientRows,
        historiales: historyRows,
      },
      recentActivity,
    },
  });
});

router.post('/admin/doctors', authorizeRoles('admin'), async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password ?? '');
  const doctorInput = {
    nombre_completo: normalizeValue(req.body.nombre_completo),
    ci: normalizeValue(req.body.ci),
    email,
    telefono: normalizeValue(req.body.telefono),
    especialidad: normalizeValue(req.body.especialidad),
    licencia_medica: normalizeValue(req.body.licencia_medica),
    clinica_id: normalizeValue(req.body.clinica_id),
    horario: normalizeValue(req.body.horario),
    activo: true,
  };

  const validationError = validateMedicoPayload(doctorInput);

  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  if (!doctorInput.clinica_id) {
    return res.status(400).json({
      success: false,
      message: 'Selecciona una clínica asignada',
      field: 'clinicId',
    });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener mayúscula, minúscula, número y carácter especial',
      field: 'password',
    });
  }

  try {
    const existingUser = await firstByEmail('usuarios', email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario registrado con ese correo.',
        field: 'email',
      });
    }

    const existingDoctorEmail = await firstByEmail('medicos', email);

    if (existingDoctorEmail) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un médico registrado con ese correo.',
        field: 'email',
      });
    }

    const { data: existingLicense, error: licenseError } = await supabase
      .from('medicos')
      .select('id')
      .eq('licencia_medica', doctorInput.licencia_medica)
      .limit(1);

    if (licenseError) throw licenseError;

    if (existingLicense?.[0]) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un médico registrado con esa licencia médica.',
        field: 'licenseNumber',
      });
    }

    const user = await authService.register({
      nombre_completo: doctorInput.nombre_completo,
      email,
      password,
      rol: 'medico',
    });

    const { data: doctor, error } = await supabase
      .from('medicos')
      .insert({
        ...doctorInput,
        usuario_id: user.id,
      })
      .select('*')
      .single();

    if (error) {
      await supabase.from('usuarios').delete().eq('id', user.id);

      return res.status(400).json({
        success: false,
        message: 'No se pudo crear la ficha del médico. Revisa los datos profesionales.',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Médico y usuario registrados correctamente',
      data: { user, doctor },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario registrado con ese correo.',
        field: 'email',
      });
    }

    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'No se pudo registrar el médico',
    });
  }
});

router.get('/citas', authorizeRoles('admin', 'recepcionista', 'medico'), async (req: AuthRequest, res) => {
  let query = supabase.from('citas').select('*').order('fecha', { ascending: false });

  if (req.user?.rol === 'medico') {
    const doctorIds = await getDoctorIdsForUser(
      normalizeValue(req.user.id),
      normalizeValue(req.user.email)
    );
    query = query.in('medico_id', doctorIds);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json(mapCitasFromDb(data || []));
});

router.post('/citas', authorizeRoles('admin', 'recepcionista', 'medico'), async (req: AuthRequest, res) => {
  const payload = {
    ...req.body,
    estado: req.body.estado || 'pending',
  };

  if (!normalizeValue(payload.paciente_id)) {
    return res.status(400).json({ success: false, message: 'Selecciona un paciente válido' });
  }

  if (!normalizeValue(payload.medico_id)) {
    return res.status(400).json({ success: false, message: 'Selecciona un médico válido' });
  }

  const resolvedDoctorUserId = await resolveDoctorUserIdForAppointment(payload.medico_id);

  if (!resolvedDoctorUserId) {
    return res.status(400).json({
      success: false,
      message: 'El médico seleccionado no está vinculado a un usuario médico activo',
    });
  }

  payload.medico_id = resolvedDoctorUserId;

  if (!normalizeValue(payload.clinica_id)) {
    return res.status(400).json({ success: false, message: 'Selecciona una clínica válida' });
  }

  if (!normalizeValue(payload.hora)) {
    return res.status(400).json({ success: false, message: 'Selecciona una hora válida' });
  }

  if (!isAppointmentDateAllowed(payload.fecha)) {
    return res.status(400).json({
      success: false,
      message: 'La fecha de la cita debe estar dentro del año actual y no puede ser pasada',
    });
  }

  if (req.user?.rol === 'medico') {
    const doctorIds = await getDoctorIdsForUser(
      normalizeValue(req.user.id),
      normalizeValue(req.user.email)
    );

    if (!doctorIds.includes(normalizeValue(payload.medico_id))) {
      return res.status(403).json({
        success: false,
        message: 'Como médico solo puedes agendar citas en tu propia agenda',
      });
    }
  }

  const normalizedPayload = normalizeCitaPayload(payload);

  const { data: occupiedSlot } = await supabase
    .from('citas')
    .select('id')
    .eq('medico_id', payload.medico_id)
    .eq('fecha', payload.fecha)
    .eq('hora', payload.hora)
    .in('estado', ['pending', 'confirmed', 'pendiente', 'confirmada'])
    .maybeSingle();

  if (occupiedSlot) {
    return res.status(400).json({
      success: false,
      message: 'El horario seleccionado ya esta ocupado para este medico',
    });
  }

  const { data, error } = await supabase.from('citas').insert(normalizedPayload).select('*').single();
  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.status(201).json(mapCitaFromDb(data));
});

router.get('/citas/paciente/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('paciente_id', req.params.id)
    .order('fecha', { ascending: false });

  if (error) return res.status(500).json({ success: false, message: error.message });
  return res.json(mapCitasFromDb(data || []));
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
  return res.json(mapCitasFromDb(data || []));
});

router.patch('/citas/:id/estado', authorizeRoles('admin', 'recepcionista', 'medico'), async (req: AuthRequest, res) => {
  const nextStatus = req.body.estado as AppointmentStatus;

  if (!['pending', 'confirmed', 'completed', 'cancelled', 'absent'].includes(nextStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Estado de cita inválido',
    });
  }

  if (await rejectIfDoctorCannotAccessAppointment(req, res)) return;

  if (req.user?.rol === 'recepcionista' && !['pending', 'confirmed', 'cancelled'].includes(nextStatus)) {
    return res.status(403).json({
      success: false,
      message: 'Recepción solo puede marcar citas como pendientes, confirmadas o canceladas',
    });
  }

  const { data, error } = await supabase
    .from('citas')
    .update(normalizeCitaPayload({ estado: nextStatus }))
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.json(mapCitaFromDb(data));
});

router.patch('/citas/:id/notas', authorizeRoles('medico', 'admin'), async (req: AuthRequest, res) => {
  if (await rejectIfDoctorCannotAccessAppointment(req, res)) return;

  const { data, error } = await supabase
    .from('citas')
    .update({ notas_doctor: req.body.notas_doctor })
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.json(mapCitaFromDb(data));
});

router.put('/citas/:id', authorizeRoles('admin', 'recepcionista', 'medico'), async (req: AuthRequest, res) => {
  // Si es médico, validar que la cita pertenezca a uno de sus IDs asociados
  if (req.user?.rol === 'medico') {
    const doctorIds = await getDoctorIdsForUser(
      normalizeValue(req.user.id),
      normalizeValue(req.user.email)
    );

    const { data: existingAppointment } = await supabase
      .from('citas')
      .select('medico_id,estado')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!existingAppointment) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada' });
    }

    if (!doctorIds.includes(normalizeValue(existingAppointment.medico_id))) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para editar esta cita' });
    }
  }

  if (req.user?.rol === 'recepcionista') {
    const { data: currentAppointment, error: currentAppointmentError } = await supabase
      .from('citas')
      .select('estado')
      .eq('id', req.params.id)
      .single();

    if (currentAppointmentError) {
      return res.status(404).json({ success: false, message: currentAppointmentError.message });
    }

    if (toAppAppointmentStatus(currentAppointment.estado) === 'completed') {
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

  if (req.body.fecha !== undefined && !isAppointmentDateAllowed(req.body.fecha)) {
    return res.status(400).json({
      success: false,
      message: 'La fecha de la cita debe estar dentro del año actual y no puede ser pasada',
    });
  }

  const { data, error } = await supabase
    .from('citas')
    .update(normalizeCitaPayload(req.body))
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.json(mapCitaFromDb(data));
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
  const validationError = validateHistorialPayload(req.body);

  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const { data, error } = await supabase
    .from('consultas_medicas')
    .insert(normalizeHistorialPayload(req.body))
    .select('*')
    .single();

  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.status(201).json(data);
});

router.put('/historial/:id', authorizeRoles('medico', 'admin'), async (req, res) => {
  const validationError = validateHistorialPayload(req.body, true);

  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  const { data, error } = await supabase
    .from('consultas_medicas')
    .update(normalizeHistorialPayload(req.body))
    .eq('id', req.params.id)
    .select('*')
    .single();

  if (error) return res.status(400).json({ success: false, message: error.message });
  return res.json(data);
});

router.use('/pacientes', authorizeRoles('admin', 'recepcionista', 'medico'), getPacienteRouter());
router.use('/medicos', authorizeRoles('admin'), getCrudRouter('medicos'));
router.use('/clinicas', authorizeRoles('admin'), getCrudRouter('clinicas'));
router.use('/especialidades', authorizeRoles('admin'), getCrudRouter('especialidades'));
router.use('/catalogos/medicos', authorizeRoles('admin', 'recepcionista', 'medico'), getReadOnlyRouter('medicos'));
router.use('/catalogos/clinicas', authorizeRoles('admin', 'recepcionista', 'medico'), getReadOnlyRouter('clinicas'));
router.use('/catalogos/especialidades', authorizeRoles('admin', 'recepcionista', 'medico'), getReadOnlyRouter('especialidades'));
router.use('/logs', authorizeRoles('admin'), getCrudRouter('logs'));

export default router;
