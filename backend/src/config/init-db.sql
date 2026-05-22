-- ClinicPRO Supabase schema
-- Keep this file aligned with the active backend code.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_completo VARCHAR(150) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'medico', 'recepcionista')),
  activo BOOLEAN NOT NULL DEFAULT true,
  ultimo_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT usuarios_nombre_no_vacio CHECK (length(trim(nombre_completo)) >= 3),
  CONSTRAINT usuarios_password_hash_no_vacio CHECK (length(password_hash) > 0)
);

CREATE TABLE IF NOT EXISTS sesiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_refresco TEXT UNIQUE NOT NULL,
  expira_en TIMESTAMPTZ NOT NULL,
  revocado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  nombre_completo VARCHAR(150),
  nombre_apellido VARCHAR(150),
  ci VARCHAR(30),
  dni_nie VARCHAR(30),
  telefono VARCHAR(30),
  email VARCHAR(100),
  fecha_nacimiento DATE,
  direccion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS especialidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  nombre_completo VARCHAR(150) NOT NULL,
  ci VARCHAR(30),
  email VARCHAR(100),
  telefono VARCHAR(30),
  especialidad VARCHAR(100),
  licencia_medica VARCHAR(100) UNIQUE,
  clinica_id UUID REFERENCES clinicas(id) ON DELETE SET NULL,
  horario TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id VARCHAR NOT NULL,
  medico_id VARCHAR NOT NULL,
  clinica_id VARCHAR NOT NULL,
  especialidad VARCHAR NOT NULL,
  fecha VARCHAR(10) NOT NULL,
  hora VARCHAR(5) NOT NULL,
  fecha_hora TIMESTAMPTZ,
  motivo TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (estado IN ('pending', 'confirmed', 'completed', 'cancelled', 'absent')),
  notas_doctor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT citas_fecha_formato CHECK (fecha ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  CONSTRAINT citas_hora_formato CHECK (hora ~ '^[0-9]{2}:[0-9]{2}$')
);

CREATE TABLE IF NOT EXISTS expedientes_clinicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id VARCHAR NOT NULL,
  antecedentes TEXT,
  alergias TEXT,
  condiciones_cronicas TEXT,
  medicamentos_actuales TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consultas_medicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id VARCHAR NOT NULL,
  diagnostico TEXT NOT NULL,
  severidad VARCHAR(30),
  medico_encargado VARCHAR(150),
  descripcion TEXT,
  tratamiento TEXT,
  proxima_cita VARCHAR(10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accion VARCHAR(120) NOT NULL,
  entidad VARCHAR(80),
  entidad_id VARCHAR(120),
  detalle JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Additive compatibility fixes for existing Supabase projects.
-- CREATE TABLE IF NOT EXISTS does not update tables that already exist.
-- Penalizaciones fue removido del alcance funcional de ClinicPRO.
DROP TABLE IF EXISTS penalizaciones;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(150);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMPTZ;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE;
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS token_refresco TEXT;
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS expira_en TIMESTAMPTZ;
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS revocado BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(150);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS nombre_apellido VARCHAR(150);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS ci VARCHAR(30);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS dni_nie VARCHAR(30);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS nombre VARCHAR(150);
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100);
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS horario TEXT;
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE especialidades ADD COLUMN IF NOT EXISTS nombre VARCHAR(100);
ALTER TABLE especialidades ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE especialidades ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE especialidades ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE citas ADD COLUMN IF NOT EXISTS paciente_id VARCHAR;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS medico_id VARCHAR;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS clinica_id VARCHAR;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS especialidad VARCHAR;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS fecha VARCHAR(10);
ALTER TABLE citas ADD COLUMN IF NOT EXISTS hora VARCHAR(5);
ALTER TABLE citas ADD COLUMN IF NOT EXISTS fecha_hora TIMESTAMPTZ;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS motivo TEXT;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE citas ADD COLUMN IF NOT EXISTS notas_doctor TEXT;
ALTER TABLE citas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE citas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE citas DROP CONSTRAINT IF EXISTS citas_estado_valido;
ALTER TABLE citas ADD CONSTRAINT citas_estado_valido
  CHECK (
    estado IN (
      'pending',
      'confirmed',
      'completed',
      'cancelled',
      'absent',
      'pendiente',
      'confirmada',
      'completada',
      'cancelada',
      'no_asistio'
    )
  );

ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS paciente_id VARCHAR;
ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS antecedentes TEXT;
ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS alergias TEXT;
ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS condiciones_cronicas TEXT;
ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS medicamentos_actuales TEXT;
ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE expedientes_clinicos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS paciente_id VARCHAR;
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS diagnostico TEXT;
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS severidad VARCHAR(30);
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS medico_encargado VARCHAR(150);
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS tratamiento TEXT;
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS proxima_cita VARCHAR(10);
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE consultas_medicas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_id ON sesiones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_token_refresco ON sesiones(token_refresco);
CREATE INDEX IF NOT EXISTS idx_sesiones_revocado ON sesiones(revocado);
CREATE INDEX IF NOT EXISTS idx_pacientes_usuario_id ON pacientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_medicos_usuario_id ON medicos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_medicos_especialidad ON medicos(especialidad);
CREATE INDEX IF NOT EXISTS idx_citas_paciente_id ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_medico_id ON citas(medico_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_logs_usuario_id ON logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
