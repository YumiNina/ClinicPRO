const { createClient } = require('@supabase/supabase-js');
const path = require('node:path');
const dotenv = require('dotenv');
const ws = require('ws');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const requiredSchema = {
  usuarios:
    'id,nombre_completo,email,rol,activo,password_hash,ultimo_login,created_at,updated_at',
  sesiones: 'id,usuario_id,token_refresco_hash,expira_en,revocado,created_at',
  pacientes: 'id,nombre_completo,ci,telefono,email,fecha_nacimiento,created_at,updated_at',
  citas: 'id,paciente_id,medico_id,clinica_id,especialidad_id,fecha,hora,fecha_hora,estado,created_at,updated_at',
  medicos: 'id,usuario_id,nombre_completo,especialidad_id,clinica_id,created_at,updated_at',
  clinicas: 'id,created_at',
  especialidades: 'id,nombre,created_at,updated_at',
  horarios_medicos: 'id,medico_id,dia_semana,hora_inicio,hora_fin,created_at,updated_at',
  expedientes_clinicos: 'id,paciente_id,created_at,updated_at',
  paciente_alergias: 'id,paciente_id,nombre,created_at',
  paciente_medicamentos: 'id,paciente_id,nombre,created_at,updated_at',
  paciente_condiciones_cronicas: 'id,paciente_id,nombre,created_at,updated_at',
  consultas_medicas: 'id,paciente_id,medico_id,diagnostico,proxima_cita,created_at,updated_at',
  logs: 'id,usuario_id,accion,entidad,entidad_id,detalle,created_at',
};

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  realtime: {
    transport: ws,
  },
});

(async () => {
  let hasErrors = false;

  for (const [table, columns] of Object.entries(requiredSchema)) {
    const { error } = await supabase.from(table).select(columns).limit(1);

    if (error) {
      hasErrors = true;
      console.log(`${table}: ERROR ${error.message}`);
    } else {
      console.log(`${table}: OK`);
    }
  }

  if (hasErrors) {
    console.error('\nSchema verification failed. Apply backend/src/config/init-db.sql in Supabase.');
    process.exit(1);
  }

  console.log('\nSchema verification passed.');
})();
