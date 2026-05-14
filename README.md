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
/patient          Panel paciente
```

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
npm run build
npm run start
npm run apply:schema
npm run verify:schema
npm run seed:demo
```

Frontend:

```bash
npm run dev
npm run build
npm run check
npm run fix
```

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
