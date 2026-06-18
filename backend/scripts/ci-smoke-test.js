const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

const requiredFiles = [
  'src/server.ts',
  'src/config/supabase.ts',
  'src/middleware/error.middleware.ts',
  'src/middleware/observability.middleware.ts',
  'src/middleware/security.middleware.ts',
  'src/modules/auth/auth.routes.ts',
  'src/modules/auth/auth.schema.ts',
  'src/modules/data/data.routes.ts',
  'src/utils/logger.ts',
  'src/utils/metrics.ts',
  'src/utils/jwt.ts',
  '.env.example',
];

const requiredEnvKeys = [
  'PORT',
  'FRONTEND_URL',
  'ALLOWED_ORIGINS',
  'LOG_LEVEL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'ACCESS_TOKEN_EXPIRES',
  'REFRESH_TOKEN_EXPIRES',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'HISTORIAL_API_URL',
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
const server = readFileSync(path.resolve(root, 'src/server.ts'), 'utf8');
const logger = readFileSync(path.resolve(root, 'src/utils/logger.ts'), 'utf8');
const authRoutes = readFileSync(path.resolve(root, 'src/modules/auth/auth.routes.ts'), 'utf8');
const securityMiddleware = readFileSync(
  path.resolve(root, 'src/middleware/security.middleware.ts'),
  'utf8',
);
const metrics = readFileSync(path.resolve(root, 'src/utils/metrics.ts'), 'utf8');
const observabilityMiddleware = readFileSync(
  path.resolve(root, 'src/middleware/observability.middleware.ts'),
  'utf8',
);

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
assert(
  server.includes('/api/health') && server.includes('process.uptime()'),
  'Server must expose a production health check with uptime.',
);
assert(
  server.includes('/api/metrics') && server.includes('renderPrometheusMetrics'),
  'Server must expose basic Prometheus-compatible metrics.',
);
assert(
  server.includes('securityHeadersMiddleware') &&
    server.includes('allowedHeaders') &&
    server.includes('exposedHeaders'),
  'Server must apply security headers and explicit CORS headers.',
);
assert(
  server.includes('ALLOWED_ORIGINS') && server.includes('FRONTEND_URL'),
  'Server CORS must support production origins through environment variables.',
);
assert(
  logger.includes('JSON.stringify') && logger.includes('sensitiveKeyPattern'),
  'Logger must write structured JSON logs and redact sensitive fields.',
);
assert(
  metrics.includes('clinicpro_http_requests_total') &&
    metrics.includes('clinicpro_http_errors_total') &&
    metrics.includes('clinicpro_http_request_duration_ms_sum'),
  'Metrics must include request volume, error count and latency.',
);
assert(
  observabilityMiddleware.includes('x-request-id') &&
    observabilityMiddleware.includes('requestId'),
  'Observability middleware must propagate x-request-id.',
);
assert(
  securityMiddleware.includes('Content-Security-Policy') &&
    securityMiddleware.includes('X-Content-Type-Options') &&
    securityMiddleware.includes('Strict-Transport-Security'),
  'Security middleware must configure browser security headers.',
);
assert(
  authRoutes.includes('createRateLimitMiddleware') &&
    authRoutes.includes('auth-login') &&
    authRoutes.includes("router.post('/login', loginRateLimit"),
  'Auth routes must apply rate limiting to login and public auth endpoints.',
);
assert(
  dataRoutes.includes("router.param('id'") && dataRoutes.includes('validateUuidParam'),
  'Data routes must reject invalid UUID route parameters before database access.',
);

console.log('Backend smoke tests passed.');
