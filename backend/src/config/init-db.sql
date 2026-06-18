-- ClinicPRO Supabase/PostgreSQL schema
-- Source of truth for the backend data model.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- Shared timestamp trigger
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- Core catalog and auth tables
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_completo VARCHAR(150) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password_hash TEXT NOT NULL,
  rol VARCHAR(20) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  ultimo_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT usuarios_nombre_no_vacio CHECK (length(trim(nombre_completo)) >= 3),
  CONSTRAINT usuarios_email_formato CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  CONSTRAINT usuarios_password_hash_no_vacio CHECK (length(trim(password_hash)) >= 20),
  CONSTRAINT usuarios_rol_valido CHECK (rol IN ('admin', 'medico', 'recepcionista'))
);

CREATE TABLE IF NOT EXISTS sesiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_refresco_hash TEXT NOT NULL,
  expira_en TIMESTAMPTZ NOT NULL,
  revocado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sesiones_token_hash_no_vacio CHECK (length(trim(token_refresco_hash)) >= 32)
);

CREATE TABLE IF NOT EXISTS clinicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(150) NOT NULL,
  direccion TEXT,
  ciudad VARCHAR(100),
  telefono VARCHAR(30),
  email VARCHAR(100),
  horario TEXT,
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT clinicas_nombre_no_vacio CHECK (length(trim(nombre)) >= 3),
  CONSTRAINT clinicas_email_formato CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  CONSTRAINT clinicas_telefono_formato CHECK (telefono IS NULL OR telefono ~ '^[0-9]{7,12}$')
);

CREATE TABLE IF NOT EXISTS especialidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT especialidades_nombre_no_vacio CHECK (length(trim(nombre)) >= 3)
);

CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  nombre_completo VARCHAR(150) NOT NULL,
  ci VARCHAR(30),
  telefono VARCHAR(30),
  email VARCHAR(100),
  fecha_nacimiento DATE,
  direccion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pacientes_nombre_no_vacio CHECK (length(trim(nombre_completo)) >= 3),
  CONSTRAINT pacientes_ci_formato CHECK (ci IS NULL OR ci ~ '^[0-9]{5,12}$'),
  CONSTRAINT pacientes_telefono_formato CHECK (telefono IS NULL OR telefono ~ '^[0-9]{7,12}$'),
  CONSTRAINT pacientes_email_formato CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  CONSTRAINT pacientes_fecha_nacimiento_valida CHECK (fecha_nacimiento IS NULL OR fecha_nacimiento <= CURRENT_DATE)
);

CREATE TABLE IF NOT EXISTS medicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  nombre_completo VARCHAR(150) NOT NULL,
  ci VARCHAR(30),
  email VARCHAR(100),
  telefono VARCHAR(30),
  especialidad_id UUID NOT NULL REFERENCES especialidades(id) ON DELETE RESTRICT,
  licencia_medica VARCHAR(100),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE SET NULL,
  horario TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT medicos_nombre_no_vacio CHECK (length(trim(nombre_completo)) >= 3),
  CONSTRAINT medicos_ci_formato CHECK (ci IS NULL OR ci ~ '^[0-9]{5,12}$'),
  CONSTRAINT medicos_telefono_formato CHECK (telefono IS NULL OR telefono ~ '^[0-9]{7,12}$'),
  CONSTRAINT medicos_email_formato CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  CONSTRAINT medicos_licencia_no_vacia CHECK (licencia_medica IS NULL OR length(trim(licencia_medica)) >= 4)
);

CREATE TABLE IF NOT EXISTS horarios_medicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medico_id UUID NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT horarios_medicos_rango_valido CHECK (hora_inicio < hora_fin),
  CONSTRAINT horarios_medicos_unico UNIQUE (medico_id, dia_semana, hora_inicio, hora_fin)
);

CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
  medico_id UUID NOT NULL REFERENCES medicos(id) ON DELETE RESTRICT,
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE RESTRICT,
  especialidad_id UUID NOT NULL REFERENCES especialidades(id) ON DELETE RESTRICT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  fecha_hora TIMESTAMPTZ GENERATED ALWAYS AS ((fecha + hora) AT TIME ZONE 'America/La_Paz') STORED,
  motivo TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'pending',
  notas_doctor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT citas_estado_valido CHECK (estado IN ('pending', 'confirmed', 'completed', 'cancelled', 'absent')),
  CONSTRAINT citas_motivo_no_vacio CHECK (motivo IS NULL OR length(trim(motivo)) >= 3)
);

CREATE TABLE IF NOT EXISTS expedientes_clinicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
  antecedentes TEXT,
  alergias TEXT,
  condiciones_cronicas TEXT,
  medicamentos_actuales TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT expedientes_paciente_unico UNIQUE (paciente_id)
);

CREATE TABLE IF NOT EXISTS paciente_alergias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre VARCHAR(120) NOT NULL,
  severidad VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT paciente_alergias_nombre_no_vacio CHECK (length(trim(nombre)) >= 2)
);

CREATE TABLE IF NOT EXISTS paciente_medicamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre VARCHAR(120) NOT NULL,
  dosis VARCHAR(120),
  frecuencia VARCHAR(120),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT paciente_medicamentos_nombre_no_vacio CHECK (length(trim(nombre)) >= 2)
);

CREATE TABLE IF NOT EXISTS paciente_condiciones_cronicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre VARCHAR(120) NOT NULL,
  observacion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT paciente_condiciones_nombre_no_vacio CHECK (length(trim(nombre)) >= 2)
);

CREATE TABLE IF NOT EXISTS consultas_medicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
  medico_id UUID REFERENCES medicos(id) ON DELETE SET NULL,
  diagnostico TEXT NOT NULL,
  severidad VARCHAR(30),
  descripcion TEXT,
  tratamiento TEXT,
  proxima_cita DATE,
  proxima_cita_id UUID REFERENCES citas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT consultas_diagnostico_no_vacio CHECK (length(trim(diagnostico)) >= 3),
  CONSTRAINT consultas_severidad_valida CHECK (
    severidad IS NULL OR lower(severidad) IN ('baja', 'media', 'alta', 'critica', 'leve', 'moderada', 'grave')
  )
);

CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accion VARCHAR(120) NOT NULL,
  entidad VARCHAR(80),
  entidad_id UUID,
  detalle JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT logs_accion_no_vacia CHECK (length(trim(accion)) >= 3)
);

-- ------------------------------------------------------------
-- Compatibility migration for older ClinicPRO Supabase projects
-- ------------------------------------------------------------
DROP TABLE IF EXISTS penalizaciones;

INSERT INTO especialidades (nombre)
SELECT 'Medicina General'
WHERE NOT EXISTS (
  SELECT 1 FROM especialidades WHERE lower(nombre) = lower('Medicina General')
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(150);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMPTZ;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE usuarios SET email = lower(trim(email)) WHERE email IS NOT NULL;
UPDATE usuarios SET nombre_completo = 'Usuario ClinicPRO' WHERE nombre_completo IS NULL OR length(trim(nombre_completo)) < 3;
UPDATE usuarios SET password_hash = 'oauth:pending-migration-placeholder' WHERE password_hash IS NULL OR length(trim(password_hash)) < 20;
UPDATE usuarios SET rol = 'recepcionista' WHERE rol IS NULL OR rol NOT IN ('admin', 'medico', 'recepcionista');

ALTER TABLE usuarios ALTER COLUMN nombre_completo SET NOT NULL;
ALTER TABLE usuarios ALTER COLUMN email SET NOT NULL;
ALTER TABLE usuarios ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE usuarios ALTER COLUMN rol SET NOT NULL;

ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS usuario_id UUID;
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS token_refresco_hash TEXT;
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS token_refresco TEXT;
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS expira_en TIMESTAMPTZ;
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS revocado BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE sesiones
SET token_refresco_hash = encode(digest(token_refresco, 'sha256'), 'hex')
WHERE token_refresco_hash IS NULL AND token_refresco IS NOT NULL;

UPDATE sesiones
SET token_refresco_hash = encode(digest(id::text, 'sha256'), 'hex')
WHERE token_refresco_hash IS NULL;

UPDATE sesiones
SET expira_en = created_at + interval '7 days'
WHERE expira_en IS NULL;

ALTER TABLE sesiones ALTER COLUMN usuario_id SET NOT NULL;
ALTER TABLE sesiones ALTER COLUMN token_refresco_hash SET NOT NULL;
ALTER TABLE sesiones ALTER COLUMN expira_en SET NOT NULL;
ALTER TABLE sesiones DROP COLUMN IF EXISTS token_refresco;

ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS usuario_id UUID;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(150);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS nombre_apellido VARCHAR(150);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS ci VARCHAR(30);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS dni_nie VARCHAR(30);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE pacientes
SET nombre_completo = COALESCE(NULLIF(trim(nombre_completo), ''), NULLIF(trim(nombre_apellido), ''), 'Paciente ClinicPRO');
UPDATE pacientes SET ci = COALESCE(NULLIF(trim(ci), ''), NULLIF(trim(dni_nie), ''));
UPDATE pacientes SET email = lower(trim(email)) WHERE email IS NOT NULL;

ALTER TABLE pacientes ALTER COLUMN nombre_completo SET NOT NULL;
ALTER TABLE pacientes DROP COLUMN IF EXISTS nombre_apellido;
ALTER TABLE pacientes DROP COLUMN IF EXISTS dni_nie;

ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS nombre VARCHAR(150);
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100);
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS horario TEXT;
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE clinicas SET nombre = 'Clinica ClinicPRO' WHERE nombre IS NULL OR length(trim(nombre)) < 3;
UPDATE clinicas SET email = lower(trim(email)) WHERE email IS NOT NULL;
ALTER TABLE clinicas ALTER COLUMN nombre SET NOT NULL;

ALTER TABLE especialidades ADD COLUMN IF NOT EXISTS nombre VARCHAR(100);
ALTER TABLE especialidades ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE especialidades ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE especialidades ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE especialidades SET nombre = 'Medicina General' WHERE nombre IS NULL OR length(trim(nombre)) < 3;
ALTER TABLE especialidades ALTER COLUMN nombre SET NOT NULL;

ALTER TABLE medicos ADD COLUMN IF NOT EXISTS usuario_id UUID;
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(150);
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS ci VARCHAR(30);
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS especialidad VARCHAR(100);
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS especialidad_id UUID;
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS licencia_medica VARCHAR(100);
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS clinica_id UUID;
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS horario TEXT;
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE medicos SET nombre_completo = 'Medico ClinicPRO' WHERE nombre_completo IS NULL OR length(trim(nombre_completo)) < 3;
UPDATE medicos SET email = lower(trim(email)) WHERE email IS NOT NULL;
UPDATE medicos m
SET especialidad_id = e.id
FROM especialidades e
WHERE m.especialidad_id IS NULL AND lower(trim(e.nombre)) = lower(trim(m.especialidad));
UPDATE medicos
SET especialidad_id = (SELECT id FROM especialidades WHERE nombre = 'Medicina General' LIMIT 1)
WHERE especialidad_id IS NULL;

ALTER TABLE medicos ALTER COLUMN nombre_completo SET NOT NULL;
ALTER TABLE medicos ALTER COLUMN especialidad_id SET NOT NULL;
ALTER TABLE medicos DROP COLUMN IF EXISTS especialidad;

ALTER TABLE citas ADD COLUMN IF NOT EXISTS paciente_id VARCHAR;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS medico_id VARCHAR;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS clinica_id VARCHAR;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS especialidad VARCHAR;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS especialidad_id UUID;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS fecha VARCHAR(10);
ALTER TABLE citas ADD COLUMN IF NOT EXISTS hora VARCHAR(8);
ALTER TABLE citas ADD COLUMN IF NOT EXISTS motivo TEXT;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE citas ADD COLUMN IF NOT EXISTS notas_doctor TEXT;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE citas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE citas SET estado = 'pending' WHERE estado = 'pendiente';
UPDATE citas SET estado = 'confirmed' WHERE estado = 'confirmada';
UPDATE citas SET estado = 'completed' WHERE estado = 'completada';
UPDATE citas SET estado = 'cancelled' WHERE estado = 'cancelada';
UPDATE citas SET estado = 'absent' WHERE estado = 'no_asistio';

UPDATE citas c
SET medico_id = m.id
FROM medicos m
WHERE c.medico_id::text = m.usuario_id::text;

UPDATE citas c
SET especialidad_id = e.id
FROM especialidades e
WHERE c.especialidad_id IS NULL AND lower(trim(e.nombre)) = lower(trim(c.especialidad));

UPDATE citas c
SET especialidad_id = m.especialidad_id
FROM medicos m
WHERE c.especialidad_id IS NULL AND c.medico_id::text = m.id::text;

UPDATE citas
SET especialidad_id = (SELECT id FROM especialidades WHERE nombre = 'Medicina General' LIMIT 1)
WHERE especialidad_id IS NULL;

ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_paciente_id_fkey;
ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_medico_id_fkey;
ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_clinica_id_fkey;
ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_especialidad_id_fkey;
ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_estado_valido;
ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_fecha_formato;
ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_hora_formato;

ALTER TABLE citas ALTER COLUMN paciente_id TYPE UUID USING paciente_id::uuid;
ALTER TABLE citas ALTER COLUMN medico_id TYPE UUID USING medico_id::uuid;
ALTER TABLE citas ALTER COLUMN clinica_id TYPE UUID USING clinica_id::uuid;
ALTER TABLE citas ALTER COLUMN especialidad_id SET NOT NULL;
ALTER TABLE citas ALTER COLUMN fecha TYPE DATE USING fecha::date;
ALTER TABLE citas ALTER COLUMN hora TYPE TIME USING hora::time;
ALTER TABLE citas ALTER COLUMN paciente_id SET NOT NULL;
ALTER TABLE citas ALTER COLUMN medico_id SET NOT NULL;
ALTER TABLE citas ALTER COLUMN clinica_id SET NOT NULL;
ALTER TABLE citas ALTER COLUMN fecha SET NOT NULL;
ALTER TABLE citas ALTER COLUMN hora SET NOT NULL;
ALTER TABLE citas DROP COLUMN IF EXISTS especialidad;
ALTER TABLE citas DROP COLUMN IF EXISTS fecha_hora;
ALTER TABLE citas ADD COLUMN fecha_hora TIMESTAMPTZ GENERATED ALWAYS AS ((fecha + hora) AT TIME ZONE 'America/La_Paz') STORED;

ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS paciente_id VARCHAR;
ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS antecedentes TEXT;
ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS alergias TEXT;
ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS condiciones_cronicas TEXT;
ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS medicamentos_actuales TEXT;
ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE expedientes_clinicos DROP CONSTRAINT IF EXISTS expedientes_clinicos_paciente_id_fkey;
ALTER TABLE expedientes_clinicos ALTER COLUMN paciente_id TYPE UUID USING paciente_id::uuid;
ALTER TABLE expedientes_clinicos ALTER COLUMN paciente_id SET NOT NULL;

ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS paciente_id VARCHAR;
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS medico_encargado VARCHAR(150);
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS medico_id UUID;
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS diagnostico TEXT;
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS severidad VARCHAR(30);
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS tratamiento TEXT;
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS proxima_cita VARCHAR(10);
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS proxima_cita_id UUID;
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE consultas_medicas cm
SET medico_id = m.id
FROM medicos m
WHERE cm.medico_id IS NULL
  AND lower(trim(cm.medico_encargado)) = lower(trim(m.nombre_completo));

UPDATE consultas_medicas
SET diagnostico = 'Registro clinico pendiente'
WHERE diagnostico IS NULL OR length(trim(diagnostico)) < 3;

ALTER TABLE consultas_medicas DROP CONSTRAINT IF EXISTS consultas_medicas_paciente_id_fkey;
ALTER TABLE consultas_medicas DROP CONSTRAINT IF EXISTS consultas_medicas_medico_id_fkey;
ALTER TABLE consultas_medicas ALTER COLUMN paciente_id TYPE UUID USING paciente_id::uuid;
ALTER TABLE consultas_medicas ALTER COLUMN proxima_cita TYPE DATE USING NULLIF(proxima_cita::text, '')::date;
ALTER TABLE consultas_medicas ALTER COLUMN paciente_id SET NOT NULL;
ALTER TABLE consultas_medicas ALTER COLUMN diagnostico SET NOT NULL;
ALTER TABLE consultas_medicas DROP COLUMN IF EXISTS medico_encargado;

ALTER TABLE logs ADD COLUMN IF NOT EXISTS usuario_id UUID;
ALTER TABLE logs ADD COLUMN IF NOT EXISTS accion VARCHAR(120);
ALTER TABLE logs ADD COLUMN IF NOT EXISTS entidad VARCHAR(80);
ALTER TABLE logs ADD COLUMN IF NOT EXISTS entidad_id VARCHAR(120);
ALTER TABLE logs ADD COLUMN IF NOT EXISTS detalle JSONB;
ALTER TABLE logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
UPDATE logs SET accion = 'accion_no_especificada' WHERE accion IS NULL OR length(trim(accion)) < 3;
ALTER TABLE logs ALTER COLUMN accion SET NOT NULL;
ALTER TABLE logs ALTER COLUMN entidad_id TYPE UUID USING
  CASE
    WHEN entidad_id::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      THEN entidad_id::text::uuid
    ELSE NULL
  END;

-- ------------------------------------------------------------
-- Foreign keys, unique constraints and checks for migrated tables
-- ------------------------------------------------------------
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_nombre_no_vacio;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_email_formato;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_password_hash_no_vacio;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_valido;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_nombre_no_vacio CHECK (length(trim(nombre_completo)) >= 3);
ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_formato CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');
ALTER TABLE usuarios ADD CONSTRAINT usuarios_password_hash_no_vacio CHECK (length(trim(password_hash)) >= 20);
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_valido CHECK (rol IN ('admin', 'medico', 'recepcionista'));

ALTER TABLE sesiones DROP CONSTRAINT IF EXISTS sesiones_token_hash_no_vacio;
ALTER TABLE sesiones ADD CONSTRAINT sesiones_token_hash_no_vacio CHECK (length(trim(token_refresco_hash)) >= 32);

ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_nombre_no_vacio;
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_ci_formato;
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_telefono_formato;
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_email_formato;
ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_fecha_nacimiento_valida;
ALTER TABLE pacientes ADD CONSTRAINT pacientes_nombre_no_vacio CHECK (length(trim(nombre_completo)) >= 3);
ALTER TABLE pacientes ADD CONSTRAINT pacientes_ci_formato CHECK (ci IS NULL OR ci ~ '^[0-9]{5,12}$');
ALTER TABLE pacientes ADD CONSTRAINT pacientes_telefono_formato CHECK (telefono IS NULL OR telefono ~ '^[0-9]{7,12}$');
ALTER TABLE pacientes ADD CONSTRAINT pacientes_email_formato CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');
ALTER TABLE pacientes ADD CONSTRAINT pacientes_fecha_nacimiento_valida CHECK (fecha_nacimiento IS NULL OR fecha_nacimiento <= CURRENT_DATE);

ALTER TABLE clinicas DROP CONSTRAINT IF EXISTS clinicas_nombre_no_vacio;
ALTER TABLE clinicas DROP CONSTRAINT IF EXISTS clinicas_email_formato;
ALTER TABLE clinicas DROP CONSTRAINT IF EXISTS clinicas_telefono_formato;
ALTER TABLE clinicas ADD CONSTRAINT clinicas_nombre_no_vacio CHECK (length(trim(nombre)) >= 3);
ALTER TABLE clinicas ADD CONSTRAINT clinicas_email_formato CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');
ALTER TABLE clinicas ADD CONSTRAINT clinicas_telefono_formato CHECK (telefono IS NULL OR telefono ~ '^[0-9]{7,12}$');

ALTER TABLE especialidades DROP CONSTRAINT IF EXISTS especialidades_nombre_no_vacio;
ALTER TABLE especialidades ADD CONSTRAINT especialidades_nombre_no_vacio CHECK (length(trim(nombre)) >= 3);

ALTER TABLE medicos DROP CONSTRAINT IF EXISTS medicos_nombre_no_vacio;
ALTER TABLE medicos DROP CONSTRAINT IF EXISTS medicos_ci_formato;
ALTER TABLE medicos DROP CONSTRAINT IF EXISTS medicos_telefono_formato;
ALTER TABLE medicos DROP CONSTRAINT IF EXISTS medicos_email_formato;
ALTER TABLE medicos DROP CONSTRAINT IF EXISTS medicos_licencia_no_vacia;
ALTER TABLE medicos ADD CONSTRAINT medicos_nombre_no_vacio CHECK (length(trim(nombre_completo)) >= 3);
ALTER TABLE medicos ADD CONSTRAINT medicos_ci_formato CHECK (ci IS NULL OR ci ~ '^[0-9]{5,12}$');
ALTER TABLE medicos ADD CONSTRAINT medicos_telefono_formato CHECK (telefono IS NULL OR telefono ~ '^[0-9]{7,12}$');
ALTER TABLE medicos ADD CONSTRAINT medicos_email_formato CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');
ALTER TABLE medicos ADD CONSTRAINT medicos_licencia_no_vacia CHECK (licencia_medica IS NULL OR length(trim(licencia_medica)) >= 4);

ALTER TABLE horarios_medicos DROP CONSTRAINT IF EXISTS horarios_medicos_rango_valido;
ALTER TABLE horarios_medicos ADD CONSTRAINT horarios_medicos_rango_valido CHECK (hora_inicio < hora_fin);

ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_motivo_no_vacio;
ALTER TABLE citas ADD CONSTRAINT citas_motivo_no_vacio CHECK (motivo IS NULL OR length(trim(motivo)) >= 3);

ALTER TABLE consultas_medicas DROP CONSTRAINT IF EXISTS consultas_diagnostico_no_vacio;
ALTER TABLE consultas_medicas DROP CONSTRAINT IF EXISTS consultas_severidad_valida;
ALTER TABLE consultas_medicas ADD CONSTRAINT consultas_diagnostico_no_vacio CHECK (length(trim(diagnostico)) >= 3);
ALTER TABLE consultas_medicas ADD CONSTRAINT consultas_severidad_valida CHECK (
  severidad IS NULL OR lower(severidad) IN ('baja', 'media', 'alta', 'critica', 'leve', 'moderada', 'grave')
);

ALTER TABLE logs DROP CONSTRAINT IF EXISTS logs_accion_no_vacia;
ALTER TABLE logs ADD CONSTRAINT logs_accion_no_vacia CHECK (length(trim(accion)) >= 3);

ALTER TABLE sesiones DROP CONSTRAINT IF EXISTS sesiones_usuario_id_fkey;
ALTER TABLE sesiones ADD CONSTRAINT sesiones_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;

ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS pacientes_usuario_id_fkey;
ALTER TABLE pacientes ADD CONSTRAINT pacientes_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;

ALTER TABLE medicos DROP CONSTRAINT IF EXISTS medicos_usuario_id_fkey;
ALTER TABLE medicos DROP CONSTRAINT IF EXISTS medicos_clinica_id_fkey;
ALTER TABLE medicos DROP CONSTRAINT IF EXISTS medicos_especialidad_id_fkey;
ALTER TABLE medicos ADD CONSTRAINT medicos_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE medicos ADD CONSTRAINT medicos_clinica_id_fkey
  FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE SET NULL;
ALTER TABLE medicos ADD CONSTRAINT medicos_especialidad_id_fkey
  FOREIGN KEY (especialidad_id) REFERENCES especialidades(id) ON DELETE RESTRICT;

ALTER TABLE citas ADD CONSTRAINT citas_paciente_id_fkey
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE RESTRICT;
ALTER TABLE citas ADD CONSTRAINT citas_medico_id_fkey
  FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE RESTRICT;
ALTER TABLE citas ADD CONSTRAINT citas_clinica_id_fkey
  FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE RESTRICT;
ALTER TABLE citas ADD CONSTRAINT citas_especialidad_id_fkey
  FOREIGN KEY (especialidad_id) REFERENCES especialidades(id) ON DELETE RESTRICT;
ALTER TABLE citas ADD CONSTRAINT citas_estado_valido
  CHECK (estado IN ('pending', 'confirmed', 'completed', 'cancelled', 'absent'));

ALTER TABLE expedientes_clinicos ADD CONSTRAINT expedientes_clinicos_paciente_id_fkey
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE RESTRICT;

ALTER TABLE consultas_medicas ADD CONSTRAINT consultas_medicas_paciente_id_fkey
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE RESTRICT;
ALTER TABLE consultas_medicas ADD CONSTRAINT consultas_medicas_medico_id_fkey
  FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE SET NULL;
ALTER TABLE consultas_medicas DROP CONSTRAINT IF EXISTS consultas_medicas_proxima_cita_id_fkey;
ALTER TABLE consultas_medicas ADD CONSTRAINT consultas_medicas_proxima_cita_id_fkey
  FOREIGN KEY (proxima_cita_id) REFERENCES citas(id) ON DELETE SET NULL;

ALTER TABLE logs DROP CONSTRAINT IF EXISTS logs_usuario_id_fkey;
ALTER TABLE logs ADD CONSTRAINT logs_usuario_id_fkey
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- Business-rule triggers that need table lookups or dynamic dates
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION ensure_medico_usuario_role()
RETURNS trigger AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF NEW.usuario_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT rol INTO user_role FROM usuarios WHERE id = NEW.usuario_id;

  IF user_role <> 'medico' THEN
    RAISE EXCEPTION 'El usuario vinculado al medico debe tener rol medico';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ensure_cita_business_rules()
RETURNS trigger AS $$
BEGIN
  IF NEW.fecha < CURRENT_DATE THEN
    RAISE EXCEPTION 'No se pueden crear citas en el pasado';
  END IF;

  IF NEW.fecha > make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, 12, 31) THEN
    RAISE EXCEPTION 'No se pueden crear citas fuera del anio actual';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM medicos m
    WHERE m.id = NEW.medico_id
      AND m.activo = true
      AND m.especialidad_id = NEW.especialidad_id
  ) THEN
    RAISE EXCEPTION 'La cita debe usar un medico activo con la especialidad seleccionada';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_medicos_usuario_role ON medicos;
CREATE TRIGGER trg_medicos_usuario_role
BEFORE INSERT OR UPDATE OF usuario_id ON medicos
FOR EACH ROW EXECUTE FUNCTION ensure_medico_usuario_role();

DROP TRIGGER IF EXISTS trg_citas_business_rules ON citas;
CREATE TRIGGER trg_citas_business_rules
BEFORE INSERT OR UPDATE OF fecha, hora, medico_id, especialidad_id ON citas
FOR EACH ROW EXECUTE FUNCTION ensure_cita_business_rules();

-- ------------------------------------------------------------
-- updated_at triggers
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_pacientes_updated_at ON pacientes;
CREATE TRIGGER trg_pacientes_updated_at
BEFORE UPDATE ON pacientes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_clinicas_updated_at ON clinicas;
CREATE TRIGGER trg_clinicas_updated_at
BEFORE UPDATE ON clinicas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_especialidades_updated_at ON especialidades;
CREATE TRIGGER trg_especialidades_updated_at
BEFORE UPDATE ON especialidades
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_medicos_updated_at ON medicos;
CREATE TRIGGER trg_medicos_updated_at
BEFORE UPDATE ON medicos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_horarios_medicos_updated_at ON horarios_medicos;
CREATE TRIGGER trg_horarios_medicos_updated_at
BEFORE UPDATE ON horarios_medicos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_citas_updated_at ON citas;
CREATE TRIGGER trg_citas_updated_at
BEFORE UPDATE ON citas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_expedientes_updated_at ON expedientes_clinicos;
CREATE TRIGGER trg_expedientes_updated_at
BEFORE UPDATE ON expedientes_clinicos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_paciente_medicamentos_updated_at ON paciente_medicamentos;
CREATE TRIGGER trg_paciente_medicamentos_updated_at
BEFORE UPDATE ON paciente_medicamentos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_paciente_condiciones_updated_at ON paciente_condiciones_cronicas;
CREATE TRIGGER trg_paciente_condiciones_updated_at
BEFORE UPDATE ON paciente_condiciones_cronicas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_consultas_updated_at ON consultas_medicas;
CREATE TRIGGER trg_consultas_updated_at
BEFORE UPDATE ON consultas_medicas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_usuarios_email_lower ON usuarios (lower(email));
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

CREATE UNIQUE INDEX IF NOT EXISTS uq_sesiones_token_refresco_hash ON sesiones(token_refresco_hash);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_id ON sesiones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_revocado ON sesiones(revocado);
CREATE INDEX IF NOT EXISTS idx_sesiones_expira_en ON sesiones(expira_en);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pacientes_usuario_id ON pacientes(usuario_id) WHERE usuario_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_pacientes_ci ON pacientes(ci) WHERE ci IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_pacientes_email_lower ON pacientes(lower(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre ON pacientes(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_pacientes_created_at ON pacientes(created_at);

CREATE UNIQUE INDEX IF NOT EXISTS uq_clinicas_email_lower ON clinicas(lower(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clinicas_nombre ON clinicas(nombre);
CREATE INDEX IF NOT EXISTS idx_clinicas_ciudad ON clinicas(ciudad);

CREATE UNIQUE INDEX IF NOT EXISTS uq_especialidades_nombre_lower ON especialidades(lower(nombre));

CREATE UNIQUE INDEX IF NOT EXISTS uq_medicos_usuario_id ON medicos(usuario_id) WHERE usuario_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_medicos_ci ON medicos(ci) WHERE ci IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_medicos_email_lower ON medicos(lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_medicos_licencia_medica ON medicos(licencia_medica) WHERE licencia_medica IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_medicos_clinica_id ON medicos(clinica_id);
CREATE INDEX IF NOT EXISTS idx_medicos_especialidad_id ON medicos(especialidad_id);
CREATE INDEX IF NOT EXISTS idx_medicos_activo ON medicos(activo);

CREATE INDEX IF NOT EXISTS idx_horarios_medicos_medico_id ON horarios_medicos(medico_id);
CREATE INDEX IF NOT EXISTS idx_horarios_medicos_dia ON horarios_medicos(dia_semana);

CREATE INDEX IF NOT EXISTS idx_citas_paciente_id ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_medico_id ON citas(medico_id);
CREATE INDEX IF NOT EXISTS idx_citas_clinica_id ON citas(clinica_id);
CREATE INDEX IF NOT EXISTS idx_citas_especialidad_id ON citas(especialidad_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_hora ON citas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE UNIQUE INDEX IF NOT EXISTS uq_citas_medico_fecha_hora_activa
  ON citas(medico_id, fecha, hora)
  WHERE estado IN ('pending', 'confirmed');

CREATE UNIQUE INDEX IF NOT EXISTS uq_expedientes_paciente_id ON expedientes_clinicos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_paciente_alergias_paciente_id ON paciente_alergias(paciente_id);
CREATE INDEX IF NOT EXISTS idx_paciente_medicamentos_paciente_id ON paciente_medicamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_paciente_condiciones_paciente_id ON paciente_condiciones_cronicas(paciente_id);

CREATE INDEX IF NOT EXISTS idx_consultas_paciente_id ON consultas_medicas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consultas_medico_id ON consultas_medicas(medico_id);
CREATE INDEX IF NOT EXISTS idx_consultas_created_at ON consultas_medicas(created_at);

CREATE INDEX IF NOT EXISTS idx_logs_usuario_id ON logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_entidad ON logs(entidad);
CREATE INDEX IF NOT EXISTS idx_logs_entidad_id ON logs(entidad_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
