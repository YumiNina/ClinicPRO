import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const requiredFiles = [
  'src/app/App.tsx',
  'src/app/routes.tsx',
  'src/app/pages/Login.tsx',
  'src/context/AuthContext.tsx',
  'src/services/api-client.ts',
  'src/utils/auth-storage.ts',
  'src/utils/form-validation.ts',
];

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

for (const file of requiredFiles) {
  assert(existsSync(resolve(root, file)), `Missing required frontend file: ${file}`);
}

const routes = readFileSync(resolve(root, 'src/app/routes.tsx'), 'utf8');
const login = readFileSync(resolve(root, 'src/app/pages/Login.tsx'), 'utf8');
const apiClient = readFileSync(resolve(root, 'src/services/api-client.ts'), 'utf8');

assert(routes.includes('/admin'), 'Admin route is not registered.');
assert(routes.includes('/doctor'), 'Doctor route is not registered.');
assert(routes.includes('/reception'), 'Reception route is not registered.');
assert(!routes.includes('path: \'/patient\''), 'Patient login route should not be exposed.');
assert(!login.includes('alert('), 'Login must use friendly inline errors instead of alert().');
assert(
  apiClient.includes('Authorization') && apiClient.includes('/auth/refresh'),
  'Axios client must attach access tokens and support refresh.',
);

console.log('Frontend smoke tests passed.');
