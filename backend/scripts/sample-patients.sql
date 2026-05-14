-- Datos ficticios para pruebas de ClinicPRO.
-- Se pueden ejecutar en el SQL Editor de Supabase.

INSERT INTO especialidades (
  id,
  nombre,
  descripcion
) VALUES
  (
    '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a',
    'Medicina General',
    'Atencion primaria y seguimiento general'
  ),
  (
    '0b0b0b0b-0b0b-4b0b-8b0b-0b0b0b0b0b0b',
    'Cardiologia',
    'Evaluacion y seguimiento cardiovascular'
  ),
  (
    '0c0c0c0c-0c0c-4c0c-8c0c-0c0c0c0c0c0c',
    'Pediatria',
    'Atencion medica para ninos y adolescentes'
  ),
  (
    '0d0d0d0d-0d0d-4d0d-8d0d-0d0d0d0d0d0d',
    'Traumatologia',
    'Lesiones osteomusculares y rehabilitacion'
  )
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  updated_at = now();

INSERT INTO clinicas (
  id,
  nombre,
  direccion,
  ciudad,
  telefono,
  email,
  horario,
  descripcion
) VALUES
  (
    '01010101-0101-4101-8101-010101010101',
    'ClinicPRO Central',
    'Av. Arce 1800',
    'La Paz',
    '22440011',
    'central.demo@clinicpro.test',
    'Lunes a viernes 08:00 - 18:00',
    'Sede principal para atencion ambulatoria'
  ),
  (
    '02020202-0202-4202-8202-020202020202',
    'ClinicPRO Norte',
    'Calle 21 de Calacoto 550',
    'La Paz',
    '22770022',
    'norte.demo@clinicpro.test',
    'Lunes a sabado 08:00 - 14:00',
    'Centro de apoyo para consultas programadas'
  )
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  direccion = EXCLUDED.direccion,
  ciudad = EXCLUDED.ciudad,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  horario = EXCLUDED.horario,
  descripcion = EXCLUDED.descripcion,
  updated_at = now();

INSERT INTO medicos (
  id,
  nombre_completo,
  ci,
  email,
  telefono,
  especialidad,
  licencia_medica,
  clinica_id,
  horario,
  activo
) VALUES
  (
    '10101010-1010-4101-8101-101010101010',
    'Dra. Elena Rivas Paredes',
    '4567890',
    'elena.rivas.demo@clinicpro.test',
    '70010010',
    'Medicina General',
    'MED-DEMO-001',
    '01010101-0101-4101-8101-010101010101',
    'Lunes, miercoles y viernes 08:00 - 12:00',
    true
  ),
  (
    '20202020-2020-4202-8202-202020202020',
    'Dr. Marco Antonio Velasco',
    '5678901',
    'marco.velasco.demo@clinicpro.test',
    '70020020',
    'Cardiologia',
    'MED-DEMO-002',
    '01010101-0101-4101-8101-010101010101',
    'Martes y jueves 09:00 - 13:00',
    true
  ),
  (
    '30303030-3030-4303-8303-303030303030',
    'Dra. Lucia Fernandez Molina',
    '6789012',
    'lucia.fernandez.demo@clinicpro.test',
    '70030030',
    'Pediatria',
    'MED-DEMO-003',
    '02020202-0202-4202-8202-020202020202',
    'Lunes a viernes 14:00 - 18:00',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  ci = EXCLUDED.ci,
  email = EXCLUDED.email,
  telefono = EXCLUDED.telefono,
  especialidad = EXCLUDED.especialidad,
  licencia_medica = EXCLUDED.licencia_medica,
  clinica_id = EXCLUDED.clinica_id,
  horario = EXCLUDED.horario,
  activo = EXCLUDED.activo,
  updated_at = now();

INSERT INTO pacientes (
  id,
  nombre_completo,
  ci,
  telefono,
  email,
  fecha_nacimiento,
  direccion
) VALUES
  (
    '11111111-1111-4111-8111-111111111111',
    'Ana Maria Rojas Vargas',
    '9012345',
    '70123456',
    'ana.rojas.demo@clinicpro.test',
    '1990-05-15',
    'Av. Arce 1234, La Paz'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Carlos Eduardo Mendoza Quiroga',
    '8123456',
    '71234567',
    'carlos.mendoza.demo@clinicpro.test',
    '1984-11-02',
    'Calle 21 de Calacoto 450, La Paz'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Mariana Fernanda Salazar Pinto',
    '7345678',
    '72345678',
    'mariana.salazar.demo@clinicpro.test',
    '1997-03-22',
    'Av. America 789, Cochabamba'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Luis Alberto Torres Medina',
    '6456789',
    '73456789',
    'luis.torres.demo@clinicpro.test',
    '1978-08-09',
    'Barrio Equipetrol Norte 321, Santa Cruz'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'Valeria Isabel Choque Mamani',
    '9567890',
    '74567890',
    'valeria.choque.demo@clinicpro.test',
    '2001-12-18',
    'Zona Villa Fatima 210, La Paz'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'Jorge Andres Camacho Rios',
    '8678901',
    '75678901',
    'jorge.camacho.demo@clinicpro.test',
    '1969-01-30',
    'Av. Blanco Galindo km 5, Cochabamba'
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    'Sofia Daniela Perez Aguilar',
    '7789012',
    '76789012',
    'sofia.perez.demo@clinicpro.test',
    '2015-07-11',
    'Calle Murillo 555, Oruro'
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    'Mateo Nicolas Gutierrez Flores',
    '9890123',
    '77890123',
    'mateo.gutierrez.demo@clinicpro.test',
    '2019-09-24',
    'Urbanizacion Las Palmas 88, Santa Cruz'
  ),
  (
    '99999999-9999-4999-8999-999999999999',
    'Patricia Elena Vargas Soria',
    '6901234',
    '78901234',
    'patricia.vargas.demo@clinicpro.test',
    '1956-04-06',
    'Av. Busch 1450, Santa Cruz'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Diego Alejandro Flores Mercado',
    '7012345',
    '79012345',
    'diego.flores.demo@clinicpro.test',
    '1992-10-27',
    'Zona Sopocachi 640, La Paz'
  )
ON CONFLICT (id) DO UPDATE SET
  nombre_completo = EXCLUDED.nombre_completo,
  ci = EXCLUDED.ci,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  fecha_nacimiento = EXCLUDED.fecha_nacimiento,
  direccion = EXCLUDED.direccion,
  updated_at = now();

INSERT INTO citas (
  id,
  paciente_id,
  medico_id,
  clinica_id,
  especialidad,
  fecha,
  hora,
  motivo,
  estado,
  notas_doctor
) VALUES
  (
    'a1111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    '20202020-2020-4202-8202-202020202020',
    '01010101-0101-4101-8101-010101010101',
    'Cardiologia',
    '2026-05-15',
    '09:00',
    'Control de presion arterial',
    'confirmed',
    null
  ),
  (
    'a2222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    '10101010-1010-4101-8101-101010101010',
    '01010101-0101-4101-8101-010101010101',
    'Medicina General',
    '2026-05-15',
    '10:30',
    'Dolor de cabeza recurrente',
    'pending',
    null
  ),
  (
    'a3333333-3333-4333-8333-333333333333',
    '33333333-3333-4333-8333-333333333333',
    '20202020-2020-4202-8202-202020202020',
    '01010101-0101-4101-8101-010101010101',
    'Cardiologia',
    '2026-05-16',
    '11:00',
    'Revision de electrocardiograma',
    'confirmed',
    null
  ),
  (
    'a4444444-4444-4444-8444-444444444444',
    '77777777-7777-4777-8777-777777777777',
    '30303030-3030-4303-8303-303030303030',
    '02020202-0202-4202-8202-020202020202',
    'Pediatria',
    '2026-05-17',
    '15:00',
    'Control pediatrico preventivo',
    'pending',
    null
  ),
  (
    'a5555555-5555-4555-8555-555555555555',
    '88888888-8888-4888-8888-888888888888',
    '30303030-3030-4303-8303-303030303030',
    '02020202-0202-4202-8202-020202020202',
    'Pediatria',
    '2026-05-18',
    '16:00',
    'Fiebre y tos',
    'confirmed',
    null
  ),
  (
    'a6666666-6666-4666-8666-666666666666',
    '11111111-1111-4111-8111-111111111111',
    '10101010-1010-4101-8101-101010101010',
    '01010101-0101-4101-8101-010101010101',
    'Medicina General',
    '2026-05-10',
    '08:30',
    'Consulta general de seguimiento',
    'completed',
    'Paciente estable. Continuar controles programados.'
  ),
  (
    'a7777777-7777-4777-8777-777777777777',
    '22222222-2222-4222-8222-222222222222',
    '20202020-2020-4202-8202-202020202020',
    '01010101-0101-4101-8101-010101010101',
    'Cardiologia',
    '2026-05-08',
    '09:30',
    'Control cardiovascular',
    'completed',
    'Se recomienda control en 30 dias.'
  ),
  (
    'a8888888-8888-4888-8888-888888888888',
    '44444444-4444-4444-8444-444444444444',
    '10101010-1010-4101-8101-101010101010',
    '01010101-0101-4101-8101-010101010101',
    'Medicina General',
    '2026-05-12',
    '12:00',
    'Consulta cancelada por paciente',
    'cancelled',
    null
  )
ON CONFLICT (id) DO UPDATE SET
  paciente_id = EXCLUDED.paciente_id,
  medico_id = EXCLUDED.medico_id,
  clinica_id = EXCLUDED.clinica_id,
  especialidad = EXCLUDED.especialidad,
  fecha = EXCLUDED.fecha,
  hora = EXCLUDED.hora,
  motivo = EXCLUDED.motivo,
  estado = EXCLUDED.estado,
  notas_doctor = EXCLUDED.notas_doctor,
  updated_at = now();

INSERT INTO consultas_medicas (
  id,
  paciente_id,
  diagnostico,
  severidad,
  medico_encargado,
  descripcion,
  tratamiento,
  proxima_cita
) VALUES
  (
    'b1111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'Hipertension arterial controlada',
    'moderada',
    'Dra. Elena Rivas Paredes',
    'Paciente acude a control. Signos vitales dentro de rango esperado.',
    'Continuar medicacion y monitoreo semanal de presion arterial.',
    '2026-06-10'
  ),
  (
    'b2222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    'Riesgo cardiovascular bajo',
    'leve',
    'Dr. Marco Antonio Velasco',
    'Control preventivo sin hallazgos de alarma.',
    'Actividad fisica moderada y control en 30 dias.',
    '2026-06-08'
  )
ON CONFLICT (id) DO UPDATE SET
  paciente_id = EXCLUDED.paciente_id,
  diagnostico = EXCLUDED.diagnostico,
  severidad = EXCLUDED.severidad,
  medico_encargado = EXCLUDED.medico_encargado,
  descripcion = EXCLUDED.descripcion,
  tratamiento = EXCLUDED.tratamiento,
  proxima_cita = EXCLUDED.proxima_cita,
  updated_at = now();
