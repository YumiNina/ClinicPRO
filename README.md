# CLINIC PRO

Sistema de gestión clínica y administrativa desarrollado con React, Express, TypeScript, Supabase PostgreSQL y Docker.

Clinic Pro incluye autenticación JWT, roles, gestión de citas, datos clínicos, paneles por perfil y conexión con Supabase.

Nota de Pull Request: cambio como prueba para validar el flujo de revisión y CI/CD.

## Problemática

Muchas clínicas pequeñas y medianas todavía gestionan pacientes, citas y registros operativos con hojas de cálculo, mensajes sueltos o procesos manuales. Esto genera información duplicada, dificultad para saber qué citas están confirmadas, poca trazabilidad sobre quién modificó un registro y riesgo de que usuarios con roles distintos accedan a funciones que no les corresponden.

Clinic Pro busca resolver esa fragmentación centralizando la operación diaria de una clínica en una sola aplicación web. El sistema separa claramente las responsabilidades de administración, personal médico y recepción, para que cada perfil trabaje con las herramientas necesarias sin exponer funciones sensibles.

## Objetivo Del Proyecto

El objetivo principal es construir una plataforma clínica moderna, segura y preparada para crecer, donde sea posible:

- Autenticar usuarios internos de la clínica.
- Redirigir a cada usuario según su rol real.
- Controlar el acceso a pantallas y endpoints protegidos.
- Registrar pacientes, médicos, clínicas, citas y consultas.
- Mantener una base de datos centralizada en Supabase PostgreSQL.
- Automatizar validaciones, builds, pruebas y generación de artefactos con GitHub Actions.
- Ejecutar el proyecto de forma reproducible con Docker y Docker Compose.

El sistema no está pensado como portal público para pacientes. En esta versión, los pacientes son registros clínicos administrados por personal autorizado; los únicos roles con acceso al sistema son `admin`, `medico` y `recepcionista`.

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

El proyecto ya cuenta con una primera versión funcional de frontend, backend, base de datos, control de sesión, CI/CD, Docker y pruebas automatizadas. La implementación actual prioriza seguridad de acceso, separación por roles, flujo de login, gestión clínica básica y evidencia técnica para defensa académica/profesional.

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

CI/CD y calidad:
- Workflow principal `CI Pipeline` para Pull Requests, push a `main` y ejecución manual.
- Workflow reutilizable para validar frontend y backend con matriz de Node.js.
- Workflow `Dockerized CI` para construir imágenes Docker y simular entrega controlada.
- Jobs separados para validación, construcción de imagen y delivery/deploy simulado.
- Caché de dependencias npm y caché Docker Buildx.
- Artefactos de build, reportes JUnit y evidencia de imágenes Docker.
- Permisos mínimos para `GITHUB_TOKEN`.
- Control de concurrencia para cancelar ejecuciones antiguas de la misma rama o PR.

Testing:
- Suite automatizada con Vitest en frontend y backend.
- Testing Library + jsdom para validar comportamiento visible en componentes React.
- Pruebas unitarias para validaciones de formularios, reglas de roles y schemas de autenticación.
- Prueba de integración para rutas protegidas y redirección por rol.
- Reportes JUnit para evidencia en GitHub Actions.
- Comando de cobertura para revisar qué lógica queda cubierta por pruebas.

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

Contenedores principales:

- `clinicpro_backend`: servicio Express + TypeScript. Expone el puerto `3001`, lee variables desde `backend/.env`, conecta con Supabase y sirve los endpoints `/api/auth`, `/api/citas`, `/api/pacientes`, `/api/admin` y catálogos.
- `clinicpro_frontend`: aplicación React + Vite. Expone el puerto `5174`, consume el backend por las variables `VITE_API_AUTH`, `VITE_API_CITAS` y `VITE_API_HISTORIAL`, y depende del backend para iniciar dentro de Docker Compose.

La base de datos principal no corre como contenedor local porque el proyecto usa Supabase PostgreSQL como servicio externo. La conexión se controla con `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.

## Variables de Entorno

Crear `backend/.env` usando `backend/.env.example` como base.

Variables esperadas:

```env
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug
FRONTEND_URL=http://localhost:5174
ALLOWED_ORIGINS=http://localhost:5174

JWT_ACCESS_SECRET=replace_me
JWT_REFRESH_SECRET=replace_me
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
HISTORIAL_API_URL=http://historial-service:3002/api
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
- `expedientes_clinicos`
- `consultas_medicas`
- `logs`

Modelo de datos resumido:

- `usuarios`: almacena usuarios internos de la clínica, su correo, hash de contraseña, rol, estado activo y último login.
- `sesiones`: guarda refresh tokens emitidos, fecha de expiración y estado de revocación para soportar refresh token rotation y logout real.
- `pacientes`: contiene datos clínicos y administrativos del paciente. No representa un usuario con login.
- `medicos`: guarda información profesional del médico, especialidad, licencia y clínica asociada.
- `clinicas`: contiene sedes o centros de atención disponibles.
- `especialidades`: catálogo usado para clasificar médicos y citas.
- `citas`: vincula paciente, médico, clínica, especialidad, fecha, hora, estado y notas médicas.
- `expedientes_clinicos`: información clínica persistente del paciente.
- `consultas_medicas`: diagnósticos, tratamiento, severidad y seguimiento.
- `logs`: eventos relevantes para auditoría y trazabilidad.

Flujo de autenticación:

1. El usuario interno envía credenciales a `POST /api/auth/login`.
2. El backend valida el payload con Zod.
3. Se busca el usuario activo en `usuarios`.
4. La contraseña se compara contra `password_hash` usando bcrypt.
5. Si es válida, se generan `accessToken` y `refreshToken`.
6. El refresh token se guarda en `sesiones`.
7. El frontend guarda tokens bajo claves `clinicpro_access_token` y `clinicpro_refresh_token`.
8. Axios agrega automáticamente `Authorization: Bearer <token>`.
9. Las rutas protegidas validan el JWT con `authMiddleware`.
10. Las rutas sensibles aplican `authorizeRoles`.
11. Si el access token expira, el frontend llama a `/api/auth/refresh`.
12. En logout, el refresh token se revoca en backend.

Conexión y persistencia:

- El backend usa `@supabase/supabase-js` para insertar, consultar, actualizar y eliminar datos.
- Los scripts `apply:schema`, `verify:schema` y `seed:demo` usan `DATABASE_URL` para trabajar contra Supabase PostgreSQL.
- No se versiona `backend/.env`; solo se versiona `backend/.env.example` como plantilla segura.

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

## Final Demo Readiness - ISW-331

Estado honesto para rubrica final:

- URL publica frontend: `https://clinicpro-frontend-sph9.onrender.com`.
- URL publica backend: `https://clinicpro-backend-85ho.onrender.com`.
- Plataforma preparada: Render mediante `render.yaml`.
- Base de datos: Supabase PostgreSQL.
- Demo final requerida: debe ejecutarse sobre una URL publica real, no solo local.

El proyecto ya tiene frontend y backend publicados en Render. El backend fue verificado con `/api/health` y el frontend responde `200` por HTTPS. Para cerrar la demo final, prueba manualmente el flujo principal de login, dashboards y citas desde la URL publica del frontend.

Archivo de defensa final:

```txt
DEFENSA_FINAL.md
```

Arquitectura general:

```txt
Navegador
  -> Frontend React/Vite
  -> Backend Express/TypeScript
  -> Supabase PostgreSQL
```

Flujo principal para demo:

1. Abrir la URL publica del frontend.
2. Iniciar sesion con un usuario demo.
3. Mostrar dashboard segun rol.
4. Registrar o consultar pacientes.
5. Crear o consultar una cita.
6. Entrar como medico y revisar agenda/historial.
7. Confirmar persistencia refrescando la vista.
8. Probar health check del backend.

Build commands:

```bash
cd backend
npm run build

cd ../frontend
npm run build
```

Start command backend:

```bash
cd backend
npm run start
```

Instalacion local:

```bash
cd backend
npm ci

cd ../frontend
npm ci
```

Tests y auditoria:

```bash
cd backend
npm test
npm run test:smoke
npm run audit

cd ../frontend
npm test
npm run test:smoke
npm run audit
```

Docker local:

```bash
docker compose up --build
docker compose logs -f backend
docker compose down
```

Health check:

```bash
curl http://localhost:3001/api/health
curl https://clinicpro-backend-85ho.onrender.com/api/health
```

Deployment preparado en Render:

- `render.yaml` define `clinicpro-backend` como servicio Node.
- `render.yaml` define `clinicpro-frontend` como sitio static.
- Backend build: `npm ci --include=dev && npm run build`.
- Backend start: `npm run start`.
- Frontend build: `cd frontend && npm ci && npm run build`.
- Frontend publish path: `frontend/dist`.
- Backend health check: `/api/health`.

Variables y secretos:

| Variable | Tipo | Donde configurar | Nota |
|---|---|---|---|
| `FRONTEND_URL` | Configuracion | Backend cloud env | URL publica frontend |
| `ALLOWED_ORIGINS` | Configuracion | Backend cloud env | Allowlist CORS |
| `JWT_ACCESS_SECRET` | Secreto | Backend cloud env | No versionar |
| `JWT_REFRESH_SECRET` | Secreto | Backend cloud env | No versionar |
| `SUPABASE_URL` | Configuracion | Backend cloud env | Proyecto Supabase |
| `SUPABASE_ANON_KEY` | Secreto/config | Backend cloud env | No imprimir en logs |
| `SUPABASE_SERVICE_ROLE_KEY` | Secreto | Backend cloud env | No versionar |
| `DATABASE_URL` | Secreto | Backend cloud env | Conexion Postgres |
| `VITE_API_AUTH` | Configuracion publica | Frontend cloud env | URL backend `/api` |
| `VITE_API_CITAS` | Configuracion publica | Frontend cloud env | URL backend `/api` |
| `VITE_API_HISTORIAL` | Configuracion publica | Frontend cloud env | URL backend `/api` |

Usa `.env.example`, `backend/.env.example` y `frontend/.env.example` como referencia. Los archivos `.env` reales no deben subirse al repositorio.

CI/CD:

- `.github/workflows/ci.yml` corre en `pull_request`, `push` a `main` y `workflow_dispatch`.
- El workflow reutilizable instala dependencias, corre `npm audit`, lint, tests, smoke tests, build y sube artefactos.
- `.github/workflows/docker-ci.yml` valida en contenedor y construye imagenes Docker.
- El deploy real sigue pendiente; actualmente hay delivery simulation y blueprint Render.

Logs:

- Local: consola de `npm run dev` o `npm run start`.
- Docker: `docker compose logs -f backend`.
- Cloud: panel de logs del servicio backend en Render u otra plataforma.
- Buscar por `requestId`, `message`, `route`, `statusCode`.

Diagnostico rapido:

- Si el backend no inicia: revisar `PORT`, `JWT_*`, `SUPABASE_*`, `DATABASE_URL` y start command.
- Si el frontend abre pero no carga datos: revisar `VITE_API_*`, CORS y URL backend.
- Si login falla: revisar JWT secrets, usuarios seed/demo y conexion Supabase.
- Si health falla: revisar logs de backend y variables de entorno.
- Si CORS falla: revisar `FRONTEND_URL` y `ALLOWED_ORIGINS`.

Configuracion manual pendiente:

1. Crear servicios Render desde `render.yaml`.
2. Cargar secretos y variables reales.
3. Configurar Supabase y aplicar schema.
4. Configurar `VITE_API_*` con URL backend publica.
5. Probar `/api/health` publico.
6. Probar flujo principal sobre URL publica.
7. Actualizar README y `DEFENSA_FINAL.md` con URLs reales.

## Web Security

ClinicPRO incluye una revision basica y defendible para Week 18. La revision reduce riesgos comunes, pero no garantiza seguridad absoluta. La evidencia detallada esta en:

```txt
SECURITY_REVIEW.md
```

Assets protegidos:

- Usuarios internos de la clinica.
- Password hashes.
- Access tokens y refresh tokens.
- Datos personales de pacientes, medicos y usuarios.
- Datos administrativos.
- Configuracion de despliegue y variables sensibles.
- Base de datos Supabase PostgreSQL.

Entry points revisados:

- Login, registro, logout y refresh.
- Google session y registro de recepcionista con Google.
- Formularios de pacientes, medicos, clinicas, citas e historial.
- JSON request bodies.
- Parametros URL como `:id`.
- Panel admin y endpoints protegidos bajo `/api`.
- Health check y metrics endpoints.

Controles existentes:

- Password hashing con bcrypt.
- JWT con expiracion configurable.
- Refresh token guardado como hash.
- Middleware `authMiddleware` para rutas privadas.
- Middleware `authorizeRoles` para separar `admin`, `medico` y `recepcionista`.
- Validacion Zod en autenticacion.
- Validaciones manuales en endpoints de datos.
- Supabase query builder y whitelists de tablas/campos para reducir injection.
- Logger estructurado con redaccion de campos sensibles.
- Error handler centralizado.
- `.env` ignorado y `.env.example` con placeholders.

Fixes de seguridad agregados para Week 18:

| Fix | Riesgo reducido | Evidencia |
|---|---|---|
| Security headers | Clickjacking, MIME sniffing, leakage de referrer y permisos del navegador | `backend/src/middleware/security.middleware.ts` |
| Rate limiting en auth | Fuerza bruta y abuso de endpoints publicos | `backend/src/modules/auth/auth.routes.ts` |
| Validacion UUID de `:id` | Inputs invalidos antes de llegar a DB | `backend/src/middleware/security.middleware.ts`, `backend/src/modules/data/data.routes.ts` |
| CORS explicito | Origenes y headers demasiado amplios | `backend/src/server.ts` |
| Dependency audit | Dependencias vulnerables sin revision | `backend/package.json`, `frontend/package.json`, workflows |
| Dependency audit fix | Vulnerabilidades conocidas en dependencias npm | `backend/package-lock.json`, `frontend/package-lock.json` |

Secretos:

- Los secretos reales deben vivir en `.env` local, Render, GitHub Secrets o un secret manager.
- `.env` y `.env.*` estan ignorados por Git.
- `backend/.env.example` solo contiene placeholders.
- No se deben poner secretos en variables `VITE_*` porque el frontend las expone al navegador.

Validacion de entradas:

- Auth usa Zod en `backend/src/modules/auth/auth.schema.ts`.
- Datos clinicos/administrativos usan validaciones manuales en `backend/src/modules/data/data.routes.ts`.
- Los parametros `:id` se validan como UUID antes de consultar Supabase.
- Los payloads se normalizan con whitelists, evitando aceptar campos arbitrarios.

Rutas protegidas:

- `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh` y Google auth son publicas pero tienen rate limit.
- El resto de `/api` pasa por `authMiddleware`.
- Endpoints sensibles usan `authorizeRoles`.
- CORS no reemplaza autenticacion ni autorizacion.

XSS, CSRF e injection:

- React escapa texto por defecto.
- No se observo renderizado de HTML no confiable desde usuarios.
- La autenticacion usa `Authorization: Bearer`, por lo que el CSRF clasico de cookies automaticas es menos probable.
- Si se migran tokens a cookies HttpOnly, se debe agregar proteccion CSRF/SameSite.
- El acceso a DB usa Supabase query builder y whitelists, no SQL concatenado desde input.

Dependency scan:

```bash
cd backend
npm run audit

cd ../frontend
npm run audit
```

Despues de ejecutar `npm audit fix`, backend y frontend reportaron `found 0 vulnerabilities`.

Verificaciones utiles:

```bash
cd backend
npm run build
npm test
npm run test:smoke
```

Con el backend levantado:

```bash
curl -i http://localhost:3001/api/health
curl -i -H "x-request-id: sec-demo" http://localhost:3001/api/health
```

Riesgos pendientes:

- Tokens en `localStorage`; a futuro conviene evaluar refresh token en cookie HttpOnly, Secure y SameSite.
- Rate limiting en memoria; para produccion multi-instancia conviene Redis o gateway.
- CSP inicial en API; el frontend productivo puede requerir una CSP especifica.
- Algunas rutas aun devuelven mensajes de Supabase; a futuro conviene normalizar errores.
- Falta DAST con OWASP ZAP y escaneo de imagen Docker con Trivy en entorno controlado.

## Monitoring and Logging

ClinicPRO incluye una base de observabilidad para Week 16 en el backend Express.

Stack elegido:

- Logs estructurados JSON propios, sin dependencia externa.
- Middleware de request logging con `requestId`.
- Endpoint de salud `GET /api/health`.
- Endpoint de metricas Prometheus-compatible `GET /api/metrics`.
- Error handler centralizado para respuestas seguras.
- Dashboard y alertas documentadas para una plataforma futura.

Se eligio este camino porque es portable, funciona localmente, no requiere cuentas externas ni credenciales reales y puede conectarse despues a Render Logs, Sentry, Prometheus/Grafana, Datadog o New Relic.

Logs generados:

- Inicio de aplicacion: `application.started`.
- Request recibido: `http.request.received`.
- Request completado: `http.request.completed`.
- Ruta no encontrada: `http.route.not_found`.
- Error no controlado: `http.error.unhandled`.
- Fallos de autenticacion: `auth.failure`.
- Fallos de autorizacion: `authorization.failure`.
- Fallos de servicios externos: `external_service.historial_cancellation_failed` y `external_service.historial_cancellation_error`.

Formato de logs:

```json
{
  "level": "info",
  "message": "http.request.completed",
  "timestamp": "2026-06-07T00:00:00.000Z",
  "environment": "development",
  "requestId": "uuid",
  "method": "GET",
  "route": "/api/health",
  "statusCode": 200,
  "durationMs": 12.5
}
```

Los logs pueden incluir:

- `level`
- `message`
- `timestamp`
- `environment`
- `requestId`
- `method`
- `route`
- `statusCode`
- `durationMs`
- `userId` solo cuando aplica
- `error.name`
- `error.message`
- `error.stack` solo fuera de produccion

No se debe registrar:

- Passwords.
- Tokens o JWT completos.
- API keys.
- Cookies.
- Cadenas de conexion.
- Valores completos de `DATABASE_URL`.
- Cuerpos completos de respuestas externas.
- Datos clinicos o personales sensibles.

Request ID:

- Si llega `x-request-id`, el backend lo reutiliza.
- Si no llega, genera uno nuevo.
- Siempre responde con header `x-request-id`.
- El mismo valor aparece en logs de request y error.

Health check:

```bash
curl http://localhost:3001/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "uptime": 123,
  "timestamp": "2026-06-07T00:00:00.000Z",
  "environment": "development"
}
```

Metricas:

```bash
curl http://localhost:3001/api/metrics
```

Metricas expuestas:

| Metrica | Para que sirve |
|---|---|
| `clinicpro_http_requests_total` | Request volume por metodo, ruta y status |
| `clinicpro_http_errors_total` | Conteo de errores 5xx |
| `clinicpro_http_request_duration_ms_sum` | Suma de latencias HTTP |
| `clinicpro_http_request_duration_ms_count` | Cantidad de mediciones de latencia |
| `clinicpro_auth_failures_total` | Fallos de autenticacion/autorizacion por razon |
| `clinicpro_process_uptime_seconds` | Uptime del proceso Node.js |

Dashboard propuesto:

| Panel | Fuente | Uso |
|---|---|---|
| Requests por minuto | `clinicpro_http_requests_total` | Ver trafico de la aplicacion |
| Error rate | `clinicpro_http_errors_total / clinicpro_http_requests_total` | Detectar fallos |
| Latencia promedio o p95 | `clinicpro_http_request_duration_ms_*` | Detectar lentitud |
| Top exception types | Logs `http.error.unhandled` | Ver errores dominantes |
| Health status | `/api/health` | Saber si el backend responde |
| Auth failures | `clinicpro_auth_failures_total` | Detectar problemas de login o permisos |

Alertas propuestas:

| Alerta | Condicion | Accion |
|---|---|---|
| Error rate alto | Errores 5xx > 5% durante 5 minutos | Revisar logs `http.error.unhandled`, deploy reciente y conexion a Supabase |
| Health check fallando | `/api/health` falla durante 3 minutos | Revisar logs de arranque, puerto, variables y disponibilidad del servicio |
| Latencia alta | p95 > 1500 ms durante 10 minutos | Revisar endpoints lentos, Supabase y servicios externos |

Como diagnosticar una falla:

1. Probar `/api/health`.
2. Revisar `x-request-id` de la respuesta o del cliente.
3. Buscar ese `requestId` en logs.
4. Revisar `statusCode`, `durationMs`, `route` y `error.message`.
5. Consultar `/api/metrics` para ver volumen, error rate y latencia.
6. Revisar si hubo deploy reciente o cambio de variables.

Alternativas:

- Managed: Sentry para error tracking; Datadog, New Relic o CloudWatch para logs/metricas/alertas.
- Open-source: OpenTelemetry + Prometheus + Grafana + Loki.

## Infrastructure as Code with Terraform

El proyecto incluye una carpeta:

```txt
infra/
```

El objetivo de Terraform en ClinicPRO es documentar y preparar la infraestructura necesaria para un despliegue cloud reproducible, sin subir credenciales reales ni crear recursos peligrosos. La implementacion actual es una base segura para Week 15.1: define variables, outputs, version minima de Terraform y un plan educativo de infraestructura. Cuando se elija y configure un proveedor cloud real, esta estructura se puede reemplazar o ampliar con recursos del provider correspondiente.

Terraform prepara o documenta:

- Servicio de hosting para backend Node.js.
- Hosting estatico para frontend React/Vite.
- Base de datos administrada o conexion externa a Supabase PostgreSQL.
- Configuracion de CORS, puerto y dominio.
- DNS, storage, logs y health checks como recursos opcionales.

Comandos basicos:

```bash
cd infra
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
```

`terraform plan` permite revisar los cambios antes de aplicarlos. `terraform apply` crea o actualiza infraestructura, por eso debe ejecutarse solo despues de revisar el plan. `terraform destroy` elimina recursos administrados y debe usarse con cuidado.

Terraform state guarda el estado de los recursos administrados. No se debe subir `terraform.tfstate`, `.terraform/` ni `terraform.tfvars` al repositorio porque pueden contener datos internos o sensibles. Los secretos deben configurarse en un secret manager, GitHub Actions secrets, variables protegidas de la plataforma cloud o un `terraform.tfvars` local ignorado por Git.

Terraform no reemplaza el despliegue de la aplicacion. La app todavia necesita build, variables de runtime, publicacion del frontend/backend y smoke test posterior al deploy.

| Archivo | Propósito |
|---|---|
| `infra/main.tf` | Define o documenta recursos de infraestructura |
| `infra/variables.tf` | Define variables reutilizables |
| `infra/outputs.tf` | Muestra salidas útiles |
| `infra/versions.tf` | Define versión de Terraform y providers |
| `infra/terraform.tfvars.example` | Ejemplo seguro de variables |

## Despliegue Cloud - Week 15

El proyecto queda preparado para desplegarse en Render mediante el blueprint versionado en:

```txt
render.yaml
```

Render se eligio para esta configuracion porque permite definir infraestructura como codigo desde un monorepo, separar un backend Node.js y un frontend static, configurar variables por servicio, ejecutar health checks HTTP y mantener secretos fuera del repositorio.

Estado actual:

- Base de datos cloud: Supabase PostgreSQL.
- Plataforma preparada para frontend/backend: Render.
- URL publica frontend: pendiente de generar al crear el servicio en Render.
- URL publica backend: pendiente de generar al crear el servicio en Render.
- HTTPS: Render entrega URLs HTTPS para servicios publicados; debe verificarse despues del deploy real.

Servicios definidos:

- `clinicpro-backend`: servicio web Node.js con `rootDir: backend`.
- `clinicpro-frontend`: sitio static que publica `frontend/dist`.

Comandos cloud definidos:

Backend:

```bash
npm ci && npm run build
npm run start
```

Frontend:

```bash
cd frontend && npm ci && npm run build
```

Health check:

```txt
GET /api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "uptime": 123,
  "timestamp": "2026-06-07T00:00:00.000Z"
}
```

Variables de configuracion para Render:

```txt
NODE_ENV=production
FRONTEND_URL=https://clinicpro-frontend-sph9.onrender.com
ALLOWED_ORIGINS=https://clinicpro-frontend-sph9.onrender.com
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
HISTORIAL_API_URL=https://clinicpro-backend-85ho.onrender.com/api
VITE_API_AUTH=https://clinicpro-backend-85ho.onrender.com/api
VITE_API_CITAS=https://clinicpro-backend-85ho.onrender.com/api
VITE_API_HISTORIAL=https://clinicpro-backend-85ho.onrender.com/api
```

Secretos para configurar en Render, no en Git:

```txt
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
```

Separacion entre configuracion y secretos:

- Configuracion: puertos, URLs publicas, expiraciones y modo de ejecucion.
- Secretos: claves JWT, keys de Supabase y cadena `DATABASE_URL`.
- El repositorio versiona `.env.example`; los archivos `.env` reales quedan ignorados por `.gitignore`.
- En `render.yaml`, las variables sensibles usan `sync: false` para obligar a cargarlas en el panel de Render.

Pasos de despliegue:

1. Subir los cambios a GitHub.
2. En Render, crear un Blueprint desde el repositorio y seleccionar `render.yaml`.
3. Completar las variables marcadas como `sync: false`.
4. Esperar el build del backend y frontend.
5. Copiar las URLs HTTPS generadas por Render.
6. Actualizar `FRONTEND_URL`, `ALLOWED_ORIGINS` y las variables `VITE_API_*` con las URLs reales.
7. Redeployar los servicios si se actualizaron variables de build del frontend.

Verificacion post-deploy:

```bash
curl https://clinicpro-backend-85ho.onrender.com/api/health
```

Checklist post-deploy:

- [ ] La URL publica del frontend abre por HTTPS.
- [ ] La URL publica del backend responde por HTTPS.
- [ ] `GET /api/health` responde `status: ok`.
- [ ] `FRONTEND_URL` coincide con la URL real del frontend.
- [ ] `ALLOWED_ORIGINS` incluye la URL real del frontend.
- [ ] `VITE_API_AUTH`, `VITE_API_CITAS` y `VITE_API_HISTORIAL` apuntan al backend publico.
- [ ] Los secretos JWT, Supabase y `DATABASE_URL` estan configurados en Render.
- [ ] Login funciona.
- [ ] El flujo principal por rol funciona.
- [ ] Supabase guarda y devuelve datos.
- [ ] Los logs de Render no muestran errores criticos.
- [ ] No se imprimen secretos en logs.
- [ ] No hay errores de CORS en navegador.

Fallos comunes:

- Si el backend no inicia, revisar `PORT`, start command y variables faltantes.
- Si el frontend carga pero no consulta datos, revisar `VITE_API_*`.
- Si el navegador bloquea requests, revisar `ALLOWED_ORIGINS` y `FRONTEND_URL`.
- Si login falla, revisar `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` y conexion a Supabase.
- Si el health check falla, revisar logs del backend y que `/api/health` responda `2xx`.

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

## Testing

El proyecto usa **Vitest** como herramienta principal de testing porque frontend y backend son Node.js/TypeScript, y el frontend usa Vite + React. En frontend se agregó **Testing Library** con `jsdom` para probar comportamiento visible de componentes sin depender de clases CSS ni estructura interna del DOM.

La suite de pruebas se diseñó para validar reglas que pueden afectar directamente el uso real del sistema: ingreso por rol, bloqueo de rutas, validaciones de formularios, restricciones de fechas y schemas de autenticación. La idea no es probar detalles visuales frágiles, sino comportamientos que si fallan podrían permitir datos incorrectos, accesos indebidos o flujos rotos.

Configuración:

```txt
frontend/vitest.config.ts
frontend/src/test/setup.ts
backend/vitest.config.ts
```

Comandos locales:

```bash
cd frontend
npm test
npm run test:coverage

cd backend
npm test
npm run test:coverage
```

Pruebas unitarias agregadas:

- `frontend/src/utils/form-validation.test.ts`: validación de nombres, CI, teléfonos, email y reglas de fechas.
- `frontend/src/utils/roles.test.ts`: redirección por rol y normalización `doctor` -> `medico`.
- `backend/src/modules/auth/auth.schema.test.ts`: schemas Zod de registro, login y Google/Gmail.

Estas pruebas unitarias aíslan piezas pequeñas de lógica para confirmar que las reglas del negocio funcionan sin depender de navegador real, base de datos ni servicios externos. Esto permite detectar rápido errores como aceptar letras donde solo deben ir números, permitir roles no válidos o registrar fechas fuera del rango permitido.

Prueba de integración agregada:

- `frontend/src/app/layouts/ProtectedRoute.test.tsx`: integra `RoleProtectedRoute`, React Router y el hook de autenticación mockeado para validar acceso permitido, redirección por rol y bloqueo de usuario no autenticado.

Esta prueba de integración cubre una parte crítica del producto: el control de acceso en la interfaz. Verifica que el usuario correcto pueda entrar a su panel, que un rol incorrecto sea redirigido y que una persona sin sesión no pueda entrar directamente por URL.

Casos felices cubiertos:

- Nombre, CI, teléfono y email válidos.
- Fechas válidas dentro del año actual.
- Rutas correctas para `admin`, `medico` y `recepcionista`.
- Registro válido de recepcionista.
- Login con email y password válidos.
- Usuario autorizado ve el contenido protegido.

Casos de fallo cubiertos:

- Nombre con números.
- CI/teléfono con formato inválido.
- Email malformado.
- Fecha futura o del siguiente año.
- Rol no soportado como `patient`.
- Password débil.
- Usuario autenticado con rol incorrecto.
- Usuario no autenticado redirigido al login.

Prueba diseñada con enfoque TDD:

- Regla: una cita solo puede registrarse desde hoy hasta el fin del año actual.
- Prueba: `isDateWithinCurrentYearFromToday` rechaza fechas pasadas y `2027-01-01`.
- Ciclo documentado: primero se define la expectativa de negocio en test, luego se implementa/ajusta el helper para pasar la prueba y finalmente se reutiliza en formularios y validaciones.

Reportes:

- `npm test` genera JUnit XML en `frontend/reports/junit.xml` y `backend/reports/junit.xml`.
- `npm run test:coverage` genera reporte de cobertura en `coverage/`.
- `reports/` y `coverage/` están ignorados por Git para no subir artefactos locales.

Actualmente la suite local validada incluye 23 pruebas automatizadas: 16 en frontend y 7 en backend. Esto deja una base inicial suficiente para demostrar  Testing y también sirve como punto de partida para ampliar cobertura en CRUD de pacientes, citas, médicos y expedientes clínicos.

Integración con GitHub Actions:

- `CI Pipeline` ejecuta `npm test` en el job `validate` para frontend y backend mediante el workflow reutilizable.
- `Dockerized CI` ejecuta `npm test` dentro del job `validate`, que corre en `node:20-alpine`.
- Ambos workflows suben reportes JUnit como artefactos.
- Si una prueba falla, el workflow falla y los jobs posteriores no continúan.

Evidencia para defensa:

- Mostrar los archivos `*.test.ts` y `*.test.tsx`.
- Mostrar mínimo cinco unit tests en `form-validation`, `roles` y `auth.schema`.
- Mostrar la prueba de integración de `RoleProtectedRoute`.
- Ejecutar localmente `npm test` en frontend y backend.
- En GitHub Actions mostrar logs de `Run tests`.
- Descargar artefactos JUnit generados por el pipeline.
- Explicar que los tests cubren reglas de negocio, errores comunes y control de acceso antes de permitir merge a `main`.

## Defensa Técnica

Clinic Pro puede demostrarse en una demo individual de 15 a 20 minutos siguiendo este orden:

1. Mostrar la problemática: gestión clínica dispersa, falta de trazabilidad, duplicación de datos y accesos sin separación clara.
2. Levantar el proyecto con `docker compose up --build`.
3. Abrir el frontend en `http://localhost:5174` y el backend en `http://localhost:3001`.
4. Ingresar con usuarios de prueba de `admin`, `medico` y `recepcionista`.
5. Mostrar que cada rol entra a una ruta distinta y que no puede acceder a paneles ajenos.
6. Crear o consultar pacientes, citas, médicos y clínicas.
7. Mostrar que la información se guarda y se recupera desde Supabase.
8. Ejecutar `npm test` en frontend y backend.
9. Abrir GitHub Actions y mostrar `CI Pipeline` y `Dockerized CI`.
10. Descargar un artefacto de build o reporte JUnit.

Relación entre las partes del sistema:

- Base de datos: Supabase PostgreSQL centraliza usuarios, sesiones, pacientes, citas, médicos, clínicas y consultas.
- Autenticación: Express valida credenciales, genera JWT y protege endpoints; React guarda sesión y redirige por rol.
- Docker: reproduce frontend y backend en contenedores separados, con puertos y variables controladas.
- CI/CD: GitHub Actions instala dependencias, ejecuta lint, tests, build y genera artefactos antes de entregar.
- Testing: Vitest valida reglas importantes para reducir regresiones en login, roles, formularios y rutas protegidas.

Preguntas posibles de defensa:

- ¿Por qué no existe login de paciente?
  - Porque el alcance actual es un sistema interno para clínica. Los pacientes son registros gestionados por personal autorizado.
- ¿Dónde se guardan las credenciales?
  - Las contraseñas se guardan hasheadas con bcrypt en `usuarios.password_hash`. Los secretos reales van en `.env` y no se suben al repositorio.
- ¿Cómo se protege una ruta?
  - En frontend se usa `ProtectedRoute` y `RoleProtectedRoute`; en backend se usa `authMiddleware` y `authorizeRoles`.
- ¿Qué pasa si expira el access token?
  - Axios detecta el `401`, llama a `/api/auth/refresh`, guarda nuevos tokens y reintenta la solicitud.
- ¿Cómo se demuestra que los datos se guardan?
  - Creando datos desde la interfaz o endpoints, verificando la respuesta del backend y consultando las tablas en Supabase.
- ¿Qué garantiza el pipeline?
  - Que antes de aceptar cambios se instalen dependencias, pasen lint, tests, build y se generen artefactos.
- ¿Por qué usar Docker?
  - Para reproducir el entorno de frontend y backend de manera controlada sin depender de la configuración local de cada equipo.
- ¿Qué pruebas son más importantes?
  - Las de autenticación, roles, validaciones y rutas protegidas, porque evitan accesos incorrectos y datos inválidos.

Checklist de rúbrica Semanas 9-14:

- Base de datos y autenticación: Supabase conectado, auth JWT, refresh tokens, rutas protegidas, variables de entorno y validaciones Zod.
- Dockerización y ejecución: Dockerfile por servicio, `.dockerignore`, Docker Compose, puertos documentados y variables externas.
- CI/CD: `ci.yml`, `docker-ci.yml`, matrix, caché, concurrency, permissions mínimos, artefactos y delivery simulado.
- Testing y calidad: 23 pruebas automatizadas, casos felices, casos de error, reports JUnit y ejecución en Actions.
- Explicación técnica: README con problemática, modelo de datos, auth, Docker, CI/CD, testing y preguntas de defensa.

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
