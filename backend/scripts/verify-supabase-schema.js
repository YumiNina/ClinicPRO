const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const requiredSchema = {
  usuarios:
    'id,nombre_completo,email,rol,activo,password_hash,ultimo_login,created_at,updated_at',
  sesiones: 'id,usuario_id,token_refresco,expira_en,revocado,created_at',
  pacientes: 'id,created_at',
  citas: 'id,paciente_id,medico_id,clinica_id,especialidad,fecha,hora,estado,created_at,updated_at',
  medicos: 'id,nombre_completo,created_at',
  clinicas: 'id,created_at',
  especialidades: 'id,created_at',
  expedientes_clinicos: 'id,created_at',
  consultas_medicas: 'id,created_at',
  logs: 'id,accion,created_at',
};

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

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
