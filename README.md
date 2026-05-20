# CLINIC PRO

Sistema de gestión clínica y administrativa desarrollado con React, Express, TypeScript, Supabase PostgreSQL y Docker.

Clinic Pro incluye autenticación JWT, roles, gestión de citas, datos clínicos, paneles por perfil y conexión con Supabase.

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

Actualmente la suite local validada incluye 23 pruebas automatizadas: 16 en frontend y 7 en backend. Esto deja una base inicial suficiente para demostrar Week 13 Testing y también sirve como punto de partida para ampliar cobertura en CRUD de pacientes, citas, médicos y expedientes clínicos.

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
