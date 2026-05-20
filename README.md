# CLINIC PRO

Sistema de gestión clínica y administrativa desarrollado con React, Express, TypeScript, Supabase PostgreSQL y Docker.

Clinic Pro incluye autenticación JWT, roles, gestión de citas, datos clínicos, paneles por perfil y conexión con Supabase.

## Stack

Frontend:
- React 18
- Vite
- TypeScript
- TailwindCSS
- React Router
- Axios
- Radix UI
- Lucide Icons

Backend:
- Node.js
- Express
- TypeScript
- Zod
- JWT
- bcrypt
- Supabase JS

Base de datos:
- Supabase PostgreSQL

Infraestructura:
- Docker
- Docker Compose

## Roles

El sistema maneja tres perfiles principales:

- `admin`: acceso administrativo completo.
- `medico`: agenda médica, atención de citas e historial clínico.
- `recepcionista`: gestión operativa de citas y registro inicial de pacientes.

Rutas principales:

```txt
/                 Login
/admin            Panel administrador
/doctor           Panel médico
/reception        Panel recepción
```

Los pacientes no tienen usuario de ingreso propio. En Clinic Pro, los pacientes son registros clínicos gestionados por administración/recepción y consultados por el personal médico.

## Funcionalidades Implementadas

Autenticación:
- Registro con validación Zod.
- Login con JWT.
- Access Token.
- Refresh Token.
- Refresh Token Rotation.
- Logout con revocación de sesión.
- Endpoint `/api/auth/me`.
- Interceptor Axios con `Authorization: Bearer`.
- Refresh automático cuando expira el access token.

Control de acceso:
- `ProtectedRoute`.
- `RoleProtectedRoute`.
- Middleware de autenticación backend.
- Middleware de roles backend.
- Redirección por rol después del login.

Recepción:
- Ruta propia `/reception`.
- Puede consultar y gestionar citas.
- Puede registrar pacientes.
- No tiene permisos administrativos completos.
- No puede crear/editar médicos, clínicas ni especialidades.
- No puede borrar pacientes.
- No puede editar pacientes que ya tienen una cita `completed`.
- No puede marcar citas como `completed` o `absent`.

Admin:
- Dashboard con datos reales.
- Gestión de usuarios registrados.
- Registro de clínicas.
- Registro de médicos.
- Registro de pacientes.
- Consulta global de citas.
- Sin bandeja de entrada operativa; las notificaciones quedan enfocadas en roles clínicos/recepción.

Médico:
- Dashboard médico.
- Agenda médica.
- Historial de paciente.
- Registro de notas/consulta médica.
- Bandeja con citas nuevas, confirmadas o canceladas de su agenda.

Recepción:
- Bandeja con nuevos pacientes registrados y movimientos recientes de citas.

Base de datos:
- Schema SQL para Supabase.
- Scripts para aplicar y verificar schema.
- Datos demo de pacientes, médicos, clínicas, especialidades, citas y consultas médicas.

UI:
- Login Clinic Pro.
- Tema visual unificado `slate + cyan + teal`.
- Header interno con identidad Clinic Pro.
- Perfil rediseñado con vista limpia y profesional.
- Eliminación del login duplicado.

OAuth:
- Endpoint backend para iniciar login con Google/Gmail.
- Botón visual con icono Gmail en frontend.
- Requiere activar Google Provider en Supabase y configurar credenciales OAuth de Google Cloud.

## Estructura

```txt
ClinicPRO/
├── backend/
│   ├── scripts/
│   │   ├── apply-supabase-schema.js
│   │   ├── verify-supabase-schema.js
│   │   ├── seed-patients.js
│   │   └── sample-patients.sql
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── citas/
│   │   │   └── data/
│   │   ├── types/
│   │   ├── utils/
│   │   └── server.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── config/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── types/
│   │   └── utils/
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## Ejecutar con Docker

```bash
docker compose up --build
```

Frontend:

```txt
http://localhost:5174
```

Backend:

```txt
http://localhost:3001
```

Detener:

```bash
docker compose down
```

Construir imágenes Docker de producción localmente:

```bash
docker build -t clinicpro-frontend ./frontend
docker build -t clinicpro-backend ./backend
```

Ejecutar imágenes de producción localmente:

```bash
docker run --rm -p 5174:80 clinicpro-frontend
docker run --rm --env-file backend/.env -p 3001:3001 clinicpro-backend
```

`docker compose up --build` usa los targets `dev` de cada Dockerfile para mantener hot reload y comandos de desarrollo. Los builds de GitHub Actions usan el target `production`.

## Variables de Entorno

Crear `backend/.env` usando `backend/.env.example` como base.

Variables esperadas:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5174

JWT_ACCESS_SECRET=replace_me
JWT_REFRESH_SECRET=replace_me
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
```

No subas archivos `.env` reales al repositorio.

## Base de Datos

Aplicar schema:

```bash
cd backend
npm run apply:schema
```

Verificar schema:

```bash
cd backend
npm run verify:schema
```

Cargar datos demo:

```bash
cd backend
npm run seed:demo
```

Si la conexión local a Supabase falla por DNS o red, ejecutar manualmente en Supabase SQL Editor:

```txt
backend/scripts/sample-patients.sql
```

Tablas principales:

- `usuarios`
- `sesiones`
- `pacientes`
- `medicos`
- `clinicas`
- `especialidades`
- `citas`
- `penalizaciones`
- `expedientes_clinicos`
- `consultas_medicas`
- `logs`

## Datos de Prueba

Crear usuarios de prueba:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre_completo":"Admin ClinicPRO","email":"admin@clinicpro.test","password":"Prueba2026!","rol":"admin"}'
```

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre_completo":"Doctor ClinicPRO","email":"doctor@clinicpro.test","password":"Prueba2026!","rol":"medico"}'
```

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre_completo":"Recepcion ClinicPRO","email":"recepcion@clinicpro.test","password":"Prueba2026!","rol":"recepcionista"}'
```

Accesos:

```txt
Admin:
admin@clinicpro.test
Prueba2026!

Médico:
doctor@clinicpro.test
Prueba2026!

Recepcionista:
recepcion@clinicpro.test
Prueba2026!
```

## Google/Gmail Login

El botón de Gmail usa:

```txt
GET /api/auth/google
```

Después de que Supabase devuelve el usuario de Google, Clinic Pro valida el correo con:

```txt
POST /api/auth/google/session
```

Reglas del flujo:

- Si el Gmail ya existe en `usuarios`, entra con el rol registrado.
- Si el Gmail no existe, se muestra una selección de rol.
- Si el usuario elige `recepcionista`, puede completar un formulario breve y se crea su acceso.
- Si el usuario elige `medico` o `admin`, no se crea ninguna cuenta automáticamente.
- Para `medico` y `admin`, se muestra un mensaje indicando que debe solicitar el registro a administración.

Registro permitido desde Gmail:

```txt
POST /api/auth/google/receptionist
```

Para que funcione, en Supabase debes habilitar:

```txt
Authentication > Sign In / Providers > Google
```

Y pegar credenciales creadas en Google Cloud:

- `Client ID`
- `Client Secret`

Redirect URI en Google Cloud:

```txt
https://YOUR_PROJECT.supabase.co/auth/v1/callback
```

URL Configuration en Supabase:

```txt
Site URL:
http://localhost:5174

Redirect URLs:
http://localhost:5174
http://localhost:5174/
http://localhost:5174/**
```

## Endpoints Principales

Auth:

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/google
```

Datos:

```txt
GET    /api/admin/dashboard
GET    /api/admin/users
PATCH  /api/admin/users/:id
GET    /api/citas
POST   /api/citas
GET    /api/citas/paciente/:id
GET    /api/citas/medico/:id
PATCH  /api/citas/:id/estado
PATCH  /api/citas/:id/notas
PUT    /api/citas/:id
DELETE /api/citas/:id
GET    /api/historial/paciente/:id
POST   /api/historial
GET    /api/pacientes
POST   /api/pacientes
GET    /api/medicos
GET    /api/clinicas
GET    /api/catalogos/medicos
GET    /api/catalogos/clinicas
GET    /api/catalogos/especialidades
```

## Scripts Útiles

Backend:

```bash
npm run dev
npm run lint
npm test
npm run build
npm run start
npm run apply:schema
npm run verify:schema
npm run seed:demo
```

Frontend:

```bash
npm run dev
npm run lint
npm test
npm run build
npm run check
npm run fix
```

## CI/CD Pipeline

El proyecto incluye GitHub Actions en:

```txt
.github/workflows/ci.yml
.github/workflows/reusable-node-validate.yml
```

Workflow principal:

```txt
CI Pipeline
```

Se ejecuta automáticamente en:

- `pull_request` cuando cambian archivos de `frontend/**`, `backend/**`, `.github/workflows/**`, `docker-compose.yml` o `README.md`.
- `push` hacia la rama `main` con los mismos filtros de rutas.
- Ejecución manual desde GitHub Actions con `workflow_dispatch`.

Jobs:

- `validate`: valida frontend y backend usando un workflow reutilizable.
- `delivery`: depende de `validate` con `needs: validate` y solo corre si toda la validación pasa.

Etapas de `validate`:

1. Checkout del repositorio.
2. Configuración de Node.js con `actions/setup-node`.
3. Matrix build con Node.js `20` y `22`.
4. Caché de dependencias npm usando `cache: npm`.
5. Instalación reproducible con `npm ci`.
6. Validaciones de calidad con `npm run lint --if-present`.
7. Pruebas con `npm test`.
8. Build con `npm run build`.
9. Publicación de artefactos con `actions/upload-artifact`.

Artefactos generados:

- `frontend-node-20-build`
- `frontend-node-22-build`
- `backend-node-20-build`
- `backend-node-22-build`

Buenas prácticas aplicadas:

- Permisos mínimos con `permissions: contents: read`.
- Concurrencia por workflow y rama/PR con `cancel-in-progress: true`.
- Matrix con `fail-fast: false` para ver fallos por versión sin cancelar todo prematuramente.
- Separación entre validación y entrega.
- `environment: production` en el job `delivery`.
- Entrega simulada con `echo`, sin despliegue real peligroso.
- Filtros por rutas para evitar ejecuciones innecesarias.
- Workflow reutilizable con `workflow_call` para centralizar la lógica Node.js.

Secrets:

El pipeline actual de validación no necesita secretos porque no se conecta a Supabase ni despliega en servidores reales. Si más adelante se agrega despliegue, migraciones automáticas o seed remoto desde Actions, configurar en GitHub:

```txt
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
FRONTEND_URL
```

Nunca se deben escribir credenciales reales en el repositorio ni en los workflows.

Seguridad avanzada:

Actualmente las acciones se referencian como `actions/checkout@v4`, `actions/setup-node@v4` y `actions/upload-artifact@v4` para mantener legibilidad académica. En producción estricta, lo recomendado es fijarlas por commit SHA y dejar un comentario con la versión humana.

Protección de `main` recomendada:

- Activar Branch Protection Rules en GitHub.
- Requerir Pull Request antes de fusionar.
- Requerir que `CI Pipeline / validate` pase antes del merge.
- Bloquear pushes directos a `main`.
- Mantener revisión de código obligatoria para cambios sensibles.

Evidencia para defensa:

- Abrir un Pull Request y mostrar que el workflow valida lint, tests, build y artefactos.
- Hacer merge o push a `main` y mostrar una ejecución exitosa.
- En la pestaña Actions revisar logs de `Run quality checks`, `Run tests`, `Build project` y `Upload build artifact`.
- Descargar un artefacto generado desde la ejecución.
- Mostrar que `delivery` corre después de `validate` y que no se ejecuta si `validate` falla.

El pipeline garantiza que, antes de unir cambios a `main`, frontend y backend instalan dependencias con lockfile, pasan validaciones, ejecutan pruebas, compilan correctamente y generan una salida verificable.

## Dockerized GitHub Actions

Además del pipeline base, el proyecto incluye un workflow Dockerizado:

```txt
.github/workflows/docker-ci.yml
```

Nombre del workflow:

```txt
Dockerized CI
```

Se ejecuta en:

- `pull_request` con cambios en `frontend/**`, `backend/**`, `.github/workflows/**`, `docker-compose.yml` o `README.md`.
- `push` hacia `main` con los mismos filtros.
- Ejecución manual con `workflow_dispatch`.

Tecnologías detectadas:

- Frontend: React + Vite + Node.js.
- Backend: Express + TypeScript + Node.js.
- Base de datos externa: Supabase PostgreSQL.

Dockerfiles:

- [frontend/Dockerfile](frontend/Dockerfile): multi-stage con `node:20-alpine` para instalar/build y `nginx:1.27-alpine` para servir `dist/`.
- [backend/Dockerfile](backend/Dockerfile): multi-stage con `node:20-alpine`, build TypeScript y runtime Node de producción.
- [frontend/.dockerignore](frontend/.dockerignore) y [backend/.dockerignore](backend/.dockerignore): excluyen `node_modules`, `dist`, `.git`, `.github`, `.env`, logs y archivos temporales.

Jobs del workflow Docker:

- `validate`: corre dentro de `node:20-alpine`, instala dependencias con `npm ci`, ejecuta lint, tests y build para frontend y backend.
- `build-image`: depende de `validate`, configura Docker Buildx, construye imágenes Docker y usa caché GitHub Actions.
- `deploy-simulation`: depende de `build-image`, usa `environment: production` y simula la promoción de imágenes sin desplegar en un servidor real.

Patrones aplicados:

- Job dentro de contenedor: `validate` usa `container: node:20-alpine` para reproducibilidad.
- Service container: se levanta `postgres:16` con health check `pg_isready`, variables de prueba y `DATABASE_URL` de CI.
- Build and push image: `docker/build-push-action` construye imágenes de frontend y backend.
- Caché Docker: `cache-from: type=gha` y `cache-to: type=gha,mode=max`.
- Build once, promote: `build-image` crea las imágenes una vez y expone sus nombres como outputs; `deploy-simulation` usa esos outputs.
- Separación de responsabilidades: validar, construir imagen y entregar están en jobs separados con `needs`.
- Permisos mínimos: el workflow tiene `contents: read`; solo `build-image` agrega `packages: write` para GHCR.

Imágenes generadas:

```txt
ghcr.io/<owner>/<repo>-frontend:<commit-sha>
ghcr.io/<owner>/<repo>-backend:<commit-sha>
```

En `main` también se agrega:

```txt
ghcr.io/<owner>/<repo>-frontend:latest
ghcr.io/<owner>/<repo>-backend:latest
```

El tag con `github.sha` permite trazabilidad: cada imagen queda asociada exactamente al commit que la generó.

Publicación:

- En Pull Request: `push: false`, solo construye y valida.
- En push a `main`: `push: true`, publica en GitHub Container Registry si el repositorio tiene Packages habilitado.

Secrets:

- `GITHUB_TOKEN`: lo provee GitHub automáticamente y se usa para publicar en GHCR.
- No se escriben tokens, passwords ni `.env` en los workflows.
- Si en el futuro se agrega despliegue real, usar secrets por entorno como:

```txt
DEPLOY_TOKEN
DEPLOY_HOST
DEPLOY_USER
```

Evidencia generada:

- Artefacto `dockerized-validation-builds` con `frontend/dist` y `backend/dist`.
- Artefacto `docker-image-evidence` con los nombres de imagen y commit SHA.
- Logs de Buildx mostrando uso de caché Docker y construcción de imágenes.
- Job `deploy-simulation` mostrando qué imágenes se promoverían a producción.

Seguridad avanzada:

Las acciones se mantienen como `@v4`, `@v3` y `@v6` para legibilidad académica. En producción estricta se recomienda fijarlas por commit SHA y documentar la versión humana en comentarios.

## Verificación

Checks usados durante el desarrollo:

```bash
cd backend && npm run build
cd backend && ../frontend/node_modules/.bin/biome check .
cd frontend && npm run build
cd frontend && npm run check
```

## Autor

Desarrollado por **Mayumi Nina**.

Proyecto académico y profesional de gestión clínica moderna.
