const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

const requiredFiles = [
  'src/server.ts',
  'src/config/supabase.ts',
  'src/modules/auth/auth.routes.ts',
  'src/modules/auth/auth.schema.ts',
  'src/modules/data/data.routes.ts',
  'src/utils/jwt.ts',
  '.env.example',
];

const requiredEnvKeys = [
  'PORT',
  'FRONTEND_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'ACCESS_TOKEN_EXPIRES',
  'REFRESH_TOKEN_EXPIRES',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
];

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

for (const file of requiredFiles) {
  assert(existsSync(path.resolve(root, file)), `Missing required backend file: ${file}`);
}

const envExample = readFileSync(path.resolve(root, '.env.example'), 'utf8');
const authSchema = readFileSync(path.resolve(root, 'src/modules/auth/auth.schema.ts'), 'utf8');
const dataRoutes = readFileSync(path.resolve(root, 'src/modules/data/data.routes.ts'), 'utf8');
const supabaseConfig = readFileSync(path.resolve(root, 'src/config/supabase.ts'), 'utf8');

for (const key of requiredEnvKeys) {
  assert(envExample.includes(`${key}=`), `backend/.env.example is missing ${key}.`);
}

assert(
  authSchema.includes("z.enum(['admin', 'medico', 'recepcionista'])"),
  'Auth schema must allow only the three supported roles.',
);
assert(
  dataRoutes.includes('normalizeCitaPayload') && dataRoutes.includes('normalizePacientePayload'),
  'Data routes must normalize legacy Supabase fields.',
);
assert(
  supabaseConfig.includes('transport') && supabaseConfig.includes('ws'),
  'Supabase config must provide WebSocket transport for Node 20.',
);

console.log('Backend smoke tests passed.');
