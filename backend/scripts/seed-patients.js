const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const demoData = {
  usuarios: [
    {
      id: '10101010-1010-4101-8101-101010101010',
      nombre_completo: 'Elena Rivas Paredes',
      email: 'elena.rivas.demo@clinicpro.test',
      password_hash: '$2a$10$d6ZL4Q0V1boV3LmRksOrZOmr9bbocM.QZQLdv8QmLpMCkk6nMGzNy',
      rol: 'medico',
      activo: true,
    },
    {
      id: '20202020-2020-4202-8202-202020202020',
      nombre_completo: 'Marco Antonio Velasco',
      email: 'marco.velasco.demo@clinicpro.test',
      password_hash: '$2a$10$d6ZL4Q0V1boV3LmRksOrZOmr9bbocM.QZQLdv8QmLpMCkk6nMGzNy',
      rol: 'medico',
      activo: true,
    },
    {
      id: '30303030-3030-4303-8303-303030303030',
      nombre_completo: 'Lucia Fernandez Molina',
      email: 'lucia.fernandez.demo@clinicpro.test',
      password_hash: '$2a$10$d6ZL4Q0V1boV3LmRksOrZOmr9bbocM.QZQLdv8QmLpMCkk6nMGzNy',
      rol: 'medico',
      activo: true,
    },
  ],
  especialidades: [
    {
      id: '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a',
      nombre: 'Medicina General',
      descripcion: 'Atencion primaria y seguimiento general',
    },
    {
      id: '0b0b0b0b-0b0b-4b0b-8b0b-0b0b0b0b0b0b',
      nombre: 'Cardiologia',
      descripcion: 'Evaluacion y seguimiento cardiovascular',
    },
    {
      id: '0c0c0c0c-0c0c-4c0c-8c0c-0c0c0c0c0c0c',
      nombre: 'Pediatria',
      descripcion: 'Atencion medica para ninos y adolescentes',
    },
    {
      id: '0d0d0d0d-0d0d-4d0d-8d0d-0d0d0d0d0d0d',
      nombre: 'Traumatologia',
      descripcion: 'Lesiones osteomusculares y rehabilitacion',
    },
  ],
  clinicas: [
    {
      id: '01010101-0101-4101-8101-010101010101',
      nombre: 'ClinicPRO Central',
      direccion: 'Av. Arce 1800',
      ciudad: 'La Paz',
      telefono: '22440011',
      email: 'central.demo@clinicpro.test',
      horario: 'Lunes a viernes 08:00 - 18:00',
      descripcion: 'Sede principal para atencion ambulatoria',
    },
    {
      id: '02020202-0202-4202-8202-020202020202',
      nombre: 'ClinicPRO Norte',
      direccion: 'Calle 21 de Calacoto 550',
      ciudad: 'La Paz',
      telefono: '22770022',
      email: 'norte.demo@clinicpro.test',
      horario: 'Lunes a sabado 08:00 - 14:00',
      descripcion: 'Centro de apoyo para consultas programadas',
    },
    {
      id: '03030303-0303-4303-8303-030303030303',
      nombre: 'ClinicPRO Sur',
      direccion: 'Av. Grigota 2450',
      ciudad: 'Santa Cruz',
      telefono: '33445566',
      email: 'sur.demo@clinicpro.test',
      horario: 'Lunes a viernes 08:00 - 17:00',
      descripcion: 'Sucursal para medicina general y seguimiento familiar',
    },
    {
      id: '04040404-0404-4404-8404-040404040404',
      nombre: 'ClinicPRO Valle',
      direccion: 'Av. America 1020',
      ciudad: 'Cochabamba',
      telefono: '44556677',
      email: 'valle.demo@clinicpro.test',
      horario: 'Lunes a viernes 09:00 - 18:00',
      descripcion: 'Sede regional para consultas programadas y controles',
    },
  ],
  medicos: [
    {
      id: '10101010-1010-4101-8101-101010101010',
      nombre_completo: 'Dra. Elena Rivas Paredes',
      ci: '4567890',
      email: 'elena.rivas.demo@clinicpro.test',
      telefono: '70010010',
      especialidad: 'Medicina General',
      licencia_medica: 'MED-DEMO-001',
      clinica_id: '01010101-0101-4101-8101-010101010101',
      usuario_id: '10101010-1010-4101-8101-101010101010',
      horario: 'Lunes, miercoles y viernes 08:00 - 12:00',
      activo: true,
    },
    {
      id: '20202020-2020-4202-8202-202020202020',
      nombre_completo: 'Dr. Marco Antonio Velasco',
      ci: '5678901',
      email: 'marco.velasco.demo@clinicpro.test',
      telefono: '70020020',
      especialidad: 'Cardiologia',
      licencia_medica: 'MED-DEMO-002',
      clinica_id: '01010101-0101-4101-8101-010101010101',
      usuario_id: '20202020-2020-4202-8202-202020202020',
      horario: 'Martes y jueves 09:00 - 13:00',
      activo: true,
    },
    {
      id: '30303030-3030-4303-8303-303030303030',
      nombre_completo: 'Dra. Lucia Fernandez Molina',
      ci: '6789012',
      email: 'lucia.fernandez.demo@clinicpro.test',
      telefono: '70030030',
      especialidad: 'Pediatria',
      licencia_medica: 'MED-DEMO-003',
      clinica_id: '02020202-0202-4202-8202-020202020202',
      usuario_id: '30303030-3030-4303-8303-303030303030',
      horario: 'Lunes a viernes 14:00 - 18:00',
      activo: true,
    },
  ],
  pacientes: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      nombre_completo: 'Ana Maria Rojas Vargas',
      ci: '9012345',
      telefono: '70123456',
      email: 'ana.rojas.demo@clinicpro.test',
      fecha_nacimiento: '1990-05-15',
      direccion: 'Av. Arce 1234, La Paz',
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      nombre_completo: 'Carlos Eduardo Mendoza Quiroga',
      ci: '8123456',
      telefono: '71234567',
      email: 'carlos.mendoza.demo@clinicpro.test',
      fecha_nacimiento: '1984-11-02',
      direccion: 'Calle 21 de Calacoto 450, La Paz',
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      nombre_completo: 'Mariana Fernanda Salazar Pinto',
      ci: '7345678',
      telefono: '72345678',
      email: 'mariana.salazar.demo@clinicpro.test',
      fecha_nacimiento: '1997-03-22',
      direccion: 'Av. America 789, Cochabamba',
    },
    {
      id: '44444444-4444-4444-8444-444444444444',
      nombre_completo: 'Luis Alberto Torres Medina',
      ci: '6456789',
      telefono: '73456789',
      email: 'luis.torres.demo@clinicpro.test',
      fecha_nacimiento: '1978-08-09',
      direccion: 'Barrio Equipetrol Norte 321, Santa Cruz',
    },
    {
      id: '55555555-5555-4555-8555-555555555555',
      nombre_completo: 'Valeria Isabel Choque Mamani',
      ci: '9567890',
      telefono: '74567890',
      email: 'valeria.choque.demo@clinicpro.test',
      fecha_nacimiento: '2001-12-18',
      direccion: 'Zona Villa Fatima 210, La Paz',
    },
    {
      id: '66666666-6666-4666-8666-666666666666',
      nombre_completo: 'Jorge Andres Camacho Rios',
      ci: '8678901',
      telefono: '75678901',
      email: 'jorge.camacho.demo@clinicpro.test',
      fecha_nacimiento: '1969-01-30',
      direccion: 'Av. Blanco Galindo km 5, Cochabamba',
    },
    {
      id: '77777777-7777-4777-8777-777777777777',
      nombre_completo: 'Sofia Daniela Perez Aguilar',
      ci: '7789012',
      telefono: '76789012',
      email: 'sofia.perez.demo@clinicpro.test',
      fecha_nacimiento: '2015-07-11',
      direccion: 'Calle Murillo 555, Oruro',
    },
    {
      id: '88888888-8888-4888-8888-888888888888',
      nombre_completo: 'Mateo Nicolas Gutierrez Flores',
      ci: '9890123',
      telefono: '77890123',
      email: 'mateo.gutierrez.demo@clinicpro.test',
      fecha_nacimiento: '2019-09-24',
      direccion: 'Urbanizacion Las Palmas 88, Santa Cruz',
    },
    {
      id: '99999999-9999-4999-8999-999999999999',
      nombre_completo: 'Patricia Elena Vargas Soria',
      ci: '6901234',
      telefono: '78901234',
      email: 'patricia.vargas.demo@clinicpro.test',
      fecha_nacimiento: '1956-04-06',
      direccion: 'Av. Busch 1450, Santa Cruz',
    },
    {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      nombre_completo: 'Diego Alejandro Flores Mercado',
      ci: '7012345',
      telefono: '79012345',
      email: 'diego.flores.demo@clinicpro.test',
      fecha_nacimiento: '1992-10-27',
      direccion: 'Zona Sopocachi 640, La Paz',
    },
  ],
  citas: [
    {
      id: 'a1111111-1111-4111-8111-111111111111',
      paciente_id: '11111111-1111-4111-8111-111111111111',
      medico_id: '20202020-2020-4202-8202-202020202020',
      clinica_id: '01010101-0101-4101-8101-010101010101',
      especialidad: 'Cardiologia',
      fecha: '2026-05-15',
      hora: '09:00',
      motivo: 'Control de presion arterial',
      estado: 'confirmed',
      notas_doctor: null,
    },
    {
      id: 'a2222222-2222-4222-8222-222222222222',
      paciente_id: '22222222-2222-4222-8222-222222222222',
      medico_id: '10101010-1010-4101-8101-101010101010',
      clinica_id: '01010101-0101-4101-8101-010101010101',
      especialidad: 'Medicina General',
      fecha: '2026-05-15',
      hora: '10:30',
      motivo: 'Dolor de cabeza recurrente',
      estado: 'pending',
      notas_doctor: null,
    },
    {
      id: 'a3333333-3333-4333-8333-333333333333',
      paciente_id: '33333333-3333-4333-8333-333333333333',
      medico_id: '20202020-2020-4202-8202-202020202020',
      clinica_id: '01010101-0101-4101-8101-010101010101',
      especialidad: 'Cardiologia',
      fecha: '2026-05-16',
      hora: '11:00',
      motivo: 'Revision de electrocardiograma',
      estado: 'confirmed',
      notas_doctor: null,
    },
    {
      id: 'a4444444-4444-4444-8444-444444444444',
      paciente_id: '77777777-7777-4777-8777-777777777777',
      medico_id: '30303030-3030-4303-8303-303030303030',
      clinica_id: '02020202-0202-4202-8202-020202020202',
      especialidad: 'Pediatria',
      fecha: '2026-05-17',
      hora: '15:00',
      motivo: 'Control pediatrico preventivo',
      estado: 'pending',
      notas_doctor: null,
    },
    {
      id: 'a5555555-5555-4555-8555-555555555555',
      paciente_id: '88888888-8888-4888-8888-888888888888',
      medico_id: '30303030-3030-4303-8303-303030303030',
      clinica_id: '02020202-0202-4202-8202-020202020202',
      especialidad: 'Pediatria',
      fecha: '2026-05-18',
      hora: '16:00',
      motivo: 'Fiebre y tos',
      estado: 'confirmed',
      notas_doctor: null,
    },
    {
      id: 'a6666666-6666-4666-8666-666666666666',
      paciente_id: '11111111-1111-4111-8111-111111111111',
      medico_id: '10101010-1010-4101-8101-101010101010',
      clinica_id: '01010101-0101-4101-8101-010101010101',
      especialidad: 'Medicina General',
      fecha: '2026-05-10',
      hora: '08:30',
      motivo: 'Consulta general de seguimiento',
      estado: 'completed',
      notas_doctor: 'Paciente estable. Continuar controles programados.',
    },
    {
      id: 'a7777777-7777-4777-8777-777777777777',
      paciente_id: '22222222-2222-4222-8222-222222222222',
      medico_id: '20202020-2020-4202-8202-202020202020',
      clinica_id: '01010101-0101-4101-8101-010101010101',
      especialidad: 'Cardiologia',
      fecha: '2026-05-08',
      hora: '09:30',
      motivo: 'Control cardiovascular',
      estado: 'completed',
      notas_doctor: 'Se recomienda control en 30 dias.',
    },
    {
      id: 'a8888888-8888-4888-8888-888888888888',
      paciente_id: '44444444-4444-4444-8444-444444444444',
      medico_id: '10101010-1010-4101-8101-101010101010',
      clinica_id: '01010101-0101-4101-8101-010101010101',
      especialidad: 'Medicina General',
      fecha: '2026-05-12',
      hora: '12:00',
      motivo: 'Consulta cancelada por paciente',
      estado: 'cancelled',
      notas_doctor: null,
    },
  ],
  consultas_medicas: [
    {
      id: 'b1111111-1111-4111-8111-111111111111',
      paciente_id: '11111111-1111-4111-8111-111111111111',
      diagnostico: 'Hipertension arterial controlada',
      severidad: 'moderada',
      medico_encargado: 'Dra. Elena Rivas Paredes',
      descripcion: 'Paciente acude a control. Signos vitales dentro de rango esperado.',
      tratamiento: 'Continuar medicacion y monitoreo semanal de presion arterial.',
      proxima_cita: '2026-06-10',
    },
    {
      id: 'b2222222-2222-4222-8222-222222222222',
      paciente_id: '22222222-2222-4222-8222-222222222222',
      diagnostico: 'Riesgo cardiovascular bajo',
      severidad: 'leve',
      medico_encargado: 'Dr. Marco Antonio Velasco',
      descripcion: 'Control preventivo sin hallazgos de alarma.',
      tratamiento: 'Actividad fisica moderada y control en 30 dias.',
      proxima_cita: '2026-06-08',
    },
  ],
};

const seedWithPostgres = async () => {
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL.');
  }

  const seedPath = path.resolve(__dirname, './sample-patients.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();
  await client.query(sql);
  await client.end();
};

const withLegacyPatientName = (rows) =>
  rows.map((row) => ({
    ...row,
    nombre_apellido: row.nombre_completo,
    dni_nie: row.ci,
  }));

const toLegacyAppointmentStatus = (status) => {
  const statusMap = {
    pending: 'pendiente',
    confirmed: 'confirmada',
    completed: 'completada',
    cancelled: 'cancelada',
    absent: 'no_asistio',
  };

  return statusMap[status] || status;
};

const withLegacyAppointmentDate = (rows) =>
  rows.map((row) => ({
    ...row,
    estado: toLegacyAppointmentStatus(row.estado),
    fecha_hora: `${row.fecha}T${row.hora}:00`,
  }));

const upsertTable = async (supabase, table, rows) => {
  const rowsToInsert =
    table === 'pacientes'
      ? withLegacyPatientName(rows)
      : table === 'citas'
        ? withLegacyAppointmentDate(rows)
        : rows;
  const { error } = await supabase.from(table).upsert(rowsToInsert, { onConflict: 'id' });

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  console.log(`${table}: ${rows.length} registros cargados`);
};

const seedWithSupabaseApi = async () => {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  for (const [table, rows] of Object.entries(demoData)) {
    await upsertTable(supabase, table, rows);
  }
};

(async () => {
  try {
    await seedWithPostgres();
    console.log('Sample demo data seeded successfully via DATABASE_URL.');
  } catch (postgresError) {
    console.warn(`Postgres seed failed: ${postgresError.message}`);
    console.warn('Trying Supabase API fallback...');
    await seedWithSupabaseApi();
    console.log('Sample demo data seeded successfully via Supabase API.');
  }
})().catch((error) => {
  console.error('Sample demo data seed failed:', error.message);
  process.exit(1);
});
