# DEFENSA FINAL ISW-331 - ClinicPRO

Revision final preparada el 2026-06-07.

Nota clave: ya existe despliegue publico en Render. El backend fue verificado con `/api/health` y el frontend responde por HTTPS. No se inventan credenciales ni se documentan secretos reales.

## 1. Resumen del Proyecto

ClinicPRO es una aplicacion web para gestion clinica interna. Centraliza autenticacion por roles, administracion de usuarios, pacientes, medicos, clinicas, citas, agenda medica, historial clinico y paneles por perfil.

Problema que resuelve:

- Evita gestion manual con hojas de calculo o mensajes sueltos.
- Da trazabilidad basica de citas, pacientes y usuarios.
- Separa responsabilidades entre `admin`, `medico` y `recepcionista`.

Usuario objetivo:

- Administradores de clinica.
- Medicos.
- Personal de recepcion.

## 2. URL Publica

| Punto | Estado | Evidencia | Archivo/carpeta | Lineas aproximadas | Que falta | Que debo configurar manualmente | Que mostrar en defensa |
|---|---|---|---|---:|---|---|---|
| Aplicacion desplegada en URL publica funcional | Cumple | Frontend y backend Render responden por HTTPS | `render.yaml`, README | `render.yaml` 1-48 | Probar flujo completo de negocio | Mantener variables reales en Render | Abrir ambas URLs |
| Build/despliegue automatizado o reproducible | Parcial-alto | CI valida build/tests; Render blueprint define build/start y servicios creados | `.github/workflows/ci.yml`, `render.yaml` | CI 1-48, Render 1-48 | Automatizar deploy final desde main si se requiere | Mantener GitHub/Render conectados | Mostrar workflows y deploy en Render |
| Demo sobre version desplegada | Parcial | URLs publicas existen; falta validar flujo principal manualmente | README, este archivo | varios | Probar login, dashboards y citas en URL publica | Tener usuarios demo listos | Abrir URL real, no localhost |

URL publica frontend: `https://clinicpro-frontend-sph9.onrender.com`.

URL publica backend: `https://clinicpro-backend-85ho.onrender.com`.

Plataforma compatible preparada: Render, por `render.yaml`. Tambien podria adaptarse a Railway, Fly.io, Vercel/Netlify para frontend y Render/Railway/Fly para backend.

## 3. Flujo Principal para Demo

Flujo recomendado:

1. Abrir URL publica del frontend.
2. Iniciar sesion como `admin`.
3. Mostrar dashboard admin.
4. Registrar o consultar paciente.
5. Registrar medico/clinica/especialidad si aplica.
6. Crear cita.
7. Iniciar sesion como `medico`.
8. Revisar agenda, cambiar estado o agregar notas.
9. Mostrar persistencia consultando dashboard/listas.
10. Probar health check del backend.

## 4. Aplicacion Integral y Dominio - 40 Puntos

| Elemento | Estado | Evidencia | Archivo/carpeta | Lineas aproximadas | Correccion necesaria |
|---|---|---|---|---:|---|
| Problema y valor | Cumple | README describe problema clinico | `README.md` | 9-33 | Ninguna |
| Frontend funcional | Cumple desplegado | React/Vite responde 200 en Render | `frontend/src/app` | varios | Probar flujo login/citas |
| Backend funcional | Cumple desplegado | `/api/health` responde 200 en Render | `backend/src/server.ts`, `data.routes.ts` | 1-113, varios | Probar endpoints con flujo real |
| API conectada | Parcial | Axios usa `VITE_API_*` apuntando al backend publico | `frontend/src/config/api-config.ts` | 1-4 | Verificar login desde frontend |
| Base de datos | Parcial | Supabase env + schema SQL | `backend/src/config/supabase.ts`, `init-db.sql` | 1-10, varios | Configurar Supabase real |
| Autenticacion | Cumple | bcrypt, JWT, refresh token | `auth.service.ts`, `jwt.ts` | 120-310, 10-40 | Cargar JWT secrets |
| Autorizacion | Cumple | Middleware roles | `role.middleware.ts`, `data.routes.ts` | 8-45, varios | Pruebas en deploy |
| Persistencia | Parcial | Supabase externo | `DATABASE_URL`, `SUPABASE_*` | `.env.example` | Configurar DB productiva |
| Manejo de errores | Cumple basico | Error handler global | `error.middleware.ts` | 1-61 | Uniformar errores de proveedor a futuro |
| Logs | Cumple basico | Logger estructurado | `logger.ts`, `observability.middleware.ts` | 1-81, 46-93 | Conectar a logs cloud reales |
| Health check | Cumple | `GET /api/health` publico verificado | `server.ts` | 79-85 | Ninguna |
| Arquitectura explicable | Cumple | README + este archivo | `README.md`, `DEFENSA_FINAL.md` | varios | Ninguna |
| URL publica | Cumple | Frontend y backend Render | `render.yaml` | 1-48 | Probar flujo principal |

Respuestas clave:

1. Flujo principal: login por rol, gestion de pacientes/medicos/citas e historial.
2. Problema: organizar operacion clinica interna.
3. Usuarios: admin, medico, recepcionista.
4. Componentes: React frontend, Express backend, Supabase PostgreSQL, GitHub Actions, Docker/Render.
5. Frontend-backend: Axios con URLs `VITE_API_*` y bearer token.
6. Backend-DB: Supabase JS y TypeORM/DATABASE_URL para scripts/schema.
7. Datos: Supabase PostgreSQL.
8. Auth: bcrypt + JWT access/refresh.
9. Errores: handler central, respuestas seguras, logs estructurados.
10. Incompleto: URL publica real y deploy final configurado.

## 5. Arquitectura

```txt
Usuario navegador
  -> Frontend React/Vite
  -> Axios con Authorization Bearer
  -> Backend Express/TypeScript
  -> Supabase PostgreSQL
```

Capas:

- Frontend: UI, rutas protegidas, formularios y dashboards.
- Backend: API, validacion, autenticacion, autorizacion, logs, health y metrics.
- Base de datos: Supabase PostgreSQL con tablas de usuarios, pacientes, medicos, citas y consultas.
- CI/CD: GitHub Actions valida build/tests/audit y genera artefactos.
- Deploy preparado: Render blueprint.

## 6. Frontend

Evidencia:

- `frontend/package.json`: scripts `build`, `test`, `lint`, `audit`.
- `frontend/src/config/api-config.ts`: URLs API por variables `VITE_*`.
- `frontend/src/app/routes.tsx`: rutas de aplicacion.
- `frontend/src/app/layouts/ProtectedRoute.tsx`: proteccion de rutas.

Build command:

```bash
cd frontend
npm run build
```

## 7. Backend

Evidencia:

- `backend/src/server.ts`: entrypoint productivo.
- `backend/src/modules/auth`: autenticacion.
- `backend/src/modules/data/data.routes.ts`: API principal.
- `backend/src/middleware`: auth, roles, security, observability, errors.

Build command:

```bash
cd backend
npm run build
```

Start command:

```bash
cd backend
npm run start
```

## 8. Base de Datos y Persistencia

Base de datos: Supabase PostgreSQL.

Persistencia:

- Los datos viven en Supabase, no en el contenedor local.
- Si se recrea el contenedor backend, los datos no se pierden.
- Si se cambia o elimina la base Supabase, se debe restaurar desde backup o seed.

Evidencia:

- `backend/src/config/supabase.ts`
- `backend/src/config/database.ts`
- `backend/src/config/init-db.sql`
- `backend/scripts/apply-supabase-schema.js`
- `backend/scripts/verify-supabase-schema.js`
- `backend/scripts/seed-patients.js`

## 9. Autenticacion y Autorizacion

Autenticacion:

- Password hashing con bcrypt.
- JWT access token.
- Refresh token rotation.
- Refresh token guardado como hash.

Autorizacion:

- `authMiddleware` valida token Bearer.
- `authorizeRoles` separa admin, medico y recepcionista.
- Endpoints sensibles usan roles.

Evidencia:

- `backend/src/modules/auth/auth.service.ts`
- `backend/src/utils/jwt.ts`
- `backend/src/middleware/auth.middleware.ts`
- `backend/src/middleware/role.middleware.ts`

## 10. Despliegue Publico

Estado: preparado, requiere configuracion manual.

Render blueprint:

- Backend web service.
- Frontend static service.
- Backend health check: `/api/health`.
- Variables sensibles con `sync: false`.

Evidencia: `render.yaml`.

Build/start definidos:

| Servicio | Build command | Start/publish | Archivo |
|---|---|---|---|
| Backend Render | `npm ci && npm run build` | `npm run start` | `render.yaml` |
| Frontend Render | `cd frontend && npm ci && npm run build` | `frontend/dist` | `render.yaml` |
| Backend Docker | `npm run build` | `node dist/server.js` | `backend/Dockerfile` |
| Frontend Docker | `npm run build` | Nginx static | `frontend/Dockerfile` |

## 11. Variables de Entorno

| Variable | Tipo | Archivo donde se usa | Linea aproximada | Descripcion | Debe configurarse manualmente |
|---|---|---|---:|---|---|
| `PUBLIC_FRONTEND_URL` | Configuracion | `.env.example`, defensa | 1-8 | URL publica para demo | Si, despues del deploy |
| `PUBLIC_BACKEND_URL` | Configuracion | `.env.example`, defensa | 1-8 | URL publica backend | Si, despues del deploy |
| `PORT` | Configuracion | `server.ts` | 93 | Puerto backend | Plataforma lo puede asignar |
| `NODE_ENV` | Configuracion | `server.ts`, `logger.ts`, `security.middleware.ts` | varios | Ambiente runtime | Si |
| `LOG_LEVEL` | Configuracion | `logger.ts` | 13 | Nivel de logs | Opcional |
| `FRONTEND_URL` | Configuracion | `server.ts`, `auth.controller.ts` | 34-35, 156 | CORS/OAuth redirect | Si en cloud |
| `ALLOWED_ORIGINS` | Configuracion | `server.ts` | 33-40 | Allowlist CORS | Si en cloud |
| `JWT_ACCESS_SECRET` | Secreto | `jwt.ts`, `auth.middleware.ts` | 11, 41 | Firma access JWT | Si, secreto |
| `JWT_REFRESH_SECRET` | Secreto | `jwt.ts` | 20 | Firma refresh JWT | Si, secreto |
| `ACCESS_TOKEN_EXPIRES` | Configuracion | `jwt.ts` | 13 | TTL access token | Si/opcional |
| `REFRESH_TOKEN_EXPIRES` | Configuracion | `jwt.ts` | 22 | TTL refresh token | Si/opcional |
| `SUPABASE_URL` | Configuracion sensible | `supabase.ts`, scripts | varios | URL proyecto Supabase | Si |
| `SUPABASE_ANON_KEY` | Secreto/publicable segun uso | `.env.example`, Render | varios | Key anon Supabase | Si |
| `SUPABASE_SERVICE_ROLE_KEY` | Secreto | `supabase.ts`, scripts | 8 | Service role key | Si, secreto |
| `DATABASE_URL` | Secreto | `database.ts`, scripts | 9 | Conexion Postgres | Si, secreto |
| `HISTORIAL_API_URL` | Configuracion | `cita.service.ts` | 119 | Servicio historial opcional | Opcional |
| `VITE_API_AUTH` | Configuracion publica | `api-config.ts` | 2 | URL API auth | Si en frontend cloud |
| `VITE_API_CITAS` | Configuracion publica | `api-config.ts` | 3 | URL API citas | Si en frontend cloud |
| `VITE_API_HISTORIAL` | Configuracion publica | `api-config.ts` | 4 | URL API historial | Si en frontend cloud |

## 12. Secretos

Secretos requeridos:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- Cualquier password de Supabase/Postgres dentro de `DATABASE_URL`

No deben vivir en el repositorio. Deben configurarse en:

- `backend/.env` local no versionado.
- Render env vars con `sync: false`.
- GitHub Secrets si se automatiza deploy real.
- Secret manager de la plataforma cloud.

Evidencia:

- `.gitignore` ignora `.env` y `.env.*`.
- `.env.example` y `backend/.env.example` usan placeholders.
- `render.yaml` marca secretos con `sync: false`.

## 13. Logs

Logs generados:

- `application.started`
- `http.request.received`
- `http.request.completed`
- `http.error.unhandled`
- `auth.failure`
- `authorization.failure`
- `security.rate_limit_exceeded`
- `security.invalid_route_param`

Como revisar logs:

Local:

```bash
cd backend
npm run dev
```

Docker:

```bash
docker compose logs -f backend
```

Cloud:

- Render Dashboard -> servicio backend -> Logs.
- Buscar por `requestId`, `route`, `statusCode`, `message`.

## 14. Health Check

Endpoint:

```txt
GET /api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "uptime": 123,
  "timestamp": "2026-06-07T00:00:00.000Z",
  "environment": "production"
}
```

Comando:

```bash
curl https://clinicpro-backend-85ho.onrender.com/api/health
```

En local:

```bash
curl http://localhost:3001/api/health
```

## 15. Pipeline CI/CD

| Job | Que hace | Trigger | Evidencia | Archivo | Lineas aproximadas |
|---|---|---|---|---|---:|
| `validate` | Valida frontend y backend con matriz | PR, push main, manual | reusable workflow | `.github/workflows/ci.yml` | 1-48 |
| `node-validation` | `npm ci`, audit, lint, tests, smoke, build, artefactos | llamado por CI | pasos Node | `.github/workflows/reusable-node-validate.yml` | 1-70 |
| `delivery` | Simula entrega controlada | despues de validate | `needs: validate` | `.github/workflows/ci.yml` | 39-48 |
| `docker validate` | Lint/test/build frontend/backend en contenedor | PR, push main, manual | Dockerized CI | `.github/workflows/docker-ci.yml` | 1-126 |
| `build-image` | Construye imagenes Docker y publica en GHCR si no es PR | despues de validate | Docker buildx | `.github/workflows/docker-ci.yml` | 128-210 |
| `deploy-simulation` | Simula promocion de imagenes | despues de build-image | no deploy real | `.github/workflows/docker-ci.yml` | final |
| `terraform-check` | fmt/init/validate/plan de IaC | PR infra/manual | Terraform | `.github/workflows/terraform.yml` | 1-43 |

Estado: automatizacion de build completa; deploy real parcial porque se simula o se prepara con Render, pero requiere conectar plataforma.

## 16. Testing

Backend:

- Tests Vitest auth schema.
- Smoke test de estructura, observability y security.

Frontend:

- Tests roles.
- Tests validacion formularios.
- Tests ProtectedRoute.

Comandos:

```bash
cd backend
npm test
npm run test:smoke

cd ../frontend
npm test
npm run test:smoke
```

## 17. Docker

Local:

```bash
docker compose up --build
```

Backend production image:

- `backend/Dockerfile`
- `CMD ["node", "dist/server.js"]`

Frontend production image:

- `frontend/Dockerfile`
- Nginx sirve `dist`.

## 18. Security

Evidencia:

- `SECURITY_REVIEW.md`
- `backend/src/middleware/security.middleware.ts`
- `backend/src/modules/auth/auth.routes.ts`
- `backend/src/modules/data/data.routes.ts`

Controles:

- Headers de seguridad.
- Rate limiting auth.
- Validacion UUID params.
- CORS allowlist.
- `npm audit`.
- Secrets fuera del repo.

## 19. Monitoring

Evidencia:

- `DEFENSA_MONITORING.md`
- `backend/src/utils/logger.ts`
- `backend/src/utils/metrics.ts`
- `backend/src/middleware/observability.middleware.ts`
- `GET /api/health`
- `GET /api/metrics`

## 20. Checklist Obligatorio de Demostracion

Pregunta: 1. Cual es la URL publica?
Respuesta recomendada: Frontend `https://clinicpro-frontend-sph9.onrender.com` y backend `https://clinicpro-backend-85ho.onrender.com`. El backend se verifica con `/api/health`.
Donde señalar en el proyecto: Render blueprint y README.
Archivo: `render.yaml`, `README.md`, `DEFENSA_FINAL.md`.
Lineas aproximadas: `render.yaml` 1-48.
Que mostrar durante la demo: si ya desplegaste, abrir la URL real; si no, mostrar pendiente honestamente.
Que configurar manualmente si aplica: mantener variables Render actualizadas y usuarios demo.

Pregunta: 2. Que comando construye la aplicacion?
Respuesta recomendada: Backend `npm run build` en `backend/`; frontend `npm run build` en `frontend/`.
Donde señalar en el proyecto: package scripts.
Archivo: `backend/package.json`, `frontend/package.json`.
Lineas aproximadas: scripts.
Que mostrar durante la demo: ejecutar o mostrar CI que lo ejecuta.
Que configurar manualmente si aplica: dependencias instaladas con `npm ci`.

Pregunta: 3. Que comando inicia la aplicacion?
Respuesta recomendada: Backend productivo `npm run start`, que ejecuta `node dist/server.js`; frontend productivo se sirve desde Nginx o static publish path.
Donde señalar en el proyecto: backend package, Dockerfile, render.
Archivo: `backend/package.json`, `backend/Dockerfile`, `render.yaml`.
Lineas aproximadas: scripts/CMD/startCommand.
Que mostrar durante la demo: start command de Render o Dockerfile.
Que configurar manualmente si aplica: variables runtime.

Pregunta: 4. Que variables de entorno son requeridas?
Respuesta recomendada: Backend requiere `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, y configuracion de CORS; frontend requiere `VITE_API_*`.
Donde señalar en el proyecto: tabla de variables.
Archivo: `.env.example`, `backend/.env.example`, `frontend/.env.example`.
Lineas aproximadas: todo.
Que mostrar durante la demo: env examples sin secretos.
Que configurar manualmente si aplica: valores reales en plataforma.

Pregunta: 5. Que valores son secretos y no deben vivir en el repositorio?
Respuesta recomendada: JWT secrets, service role key, DATABASE_URL y passwords/tokens.
Donde señalar en el proyecto: `.gitignore` y env docs.
Archivo: `.gitignore`, `.env.example`.
Lineas aproximadas: `.gitignore` env section.
Que mostrar durante la demo: placeholders, no valores reales.
Que configurar manualmente si aplica: Render env vars o GitHub Secrets.

Pregunta: 6. Donde se almacenan los datos?
Respuesta recomendada: En Supabase PostgreSQL, una base externa; recrear el contenedor no borra datos.
Donde señalar en el proyecto: config DB.
Archivo: `backend/src/config/supabase.ts`, `backend/src/config/database.ts`.
Lineas aproximadas: 1-10.
Que mostrar durante la demo: tabla/flujo con persistencia.
Que configurar manualmente si aplica: Supabase project y schema.

Pregunta: 7. Como se consultan los logs?
Respuesta recomendada: Local con salida del backend, Docker con `docker compose logs -f backend`, cloud en el panel del servicio backend.
Donde señalar en el proyecto: logger.
Archivo: `backend/src/utils/logger.ts`.
Lineas aproximadas: 47-81.
Que mostrar durante la demo: log con `requestId`.
Que configurar manualmente si aplica: acceso al panel de Render.

Pregunta: 8. Como verificamos que la app quedo saludable despues del despliegue?
Respuesta recomendada: Ejecutando `curl https://clinicpro-backend-85ho.onrender.com/api/health` y revisando que devuelva `status: ok`, `uptime`, `timestamp`, `environment`.
Donde señalar en el proyecto: health endpoint.
Archivo: `backend/src/server.ts`.
Lineas aproximadas: 79-85.
Que mostrar durante la demo: curl a URL real.
Que configurar manualmente si aplica: URL backend real.

## 21. Banco de Preguntas de Validacion

Pregunta 1: Recorre tu aplicacion desde la URL publica hasta la persistencia de datos. Que componentes intervienen y como se comunican?
Respuesta recomendada: La URL publica abre React, React llama al backend Express por Axios con `VITE_API_*`, el backend valida JWT/roles y consulta Supabase PostgreSQL. La persistencia vive en Supabase.
Archivo donde esta la evidencia: `frontend/src/config/api-config.ts`, `backend/src/server.ts`, `backend/src/config/supabase.ts`.
Lineas aproximadas: varios.
Que señalar durante la defensa: diagrama de arquitectura y flujo login-cita.

Pregunta 2: Muestrame el flujo principal del producto y explicame que parte resuelve cada capa.
Respuesta recomendada: Frontend muestra formularios/paneles; backend valida y aplica reglas; DB persiste usuarios, pacientes y citas; auth controla acceso.
Archivo donde esta la evidencia: `frontend/src/app`, `backend/src/modules/data/data.routes.ts`, `auth.service.ts`.
Lineas aproximadas: varios.
Que señalar durante la defensa: paginas admin/doctor/recepcion.

Pregunta 3: Si cambio un requisito importante del negocio hoy, que parte seria mas sensible y por que?
Respuesta recomendada: Las reglas de citas/roles en `data.routes.ts`, porque concentran permisos y reglas de negocio.
Archivo donde esta la evidencia: `backend/src/modules/data/data.routes.ts`.
Lineas aproximadas: varios.
Que señalar durante la defensa: validaciones y authorizeRoles.

Pregunta 4: Que decision tecnica tuvo mayor impacto y que alternativa descartaste?
Respuesta recomendada: Separar frontend React y backend Express con Supabase externo facilito despliegue y persistencia. Alternativa descartada: DB local en contenedor para produccion, porque perderia portabilidad y persistencia cloud.
Archivo donde esta la evidencia: `docker-compose.yml`, `render.yaml`, `backend/src/config/supabase.ts`.
Lineas aproximadas: varios.
Que señalar durante la defensa: Supabase externo.

Pregunta 5: Si pregunto por cualquier modulo importante, como justificas que existe?
Respuesta recomendada: Cada modulo tiene responsabilidad: auth autentica, data expone dominio, middleware protege/observa, config conecta servicios.
Archivo donde esta la evidencia: estructura `backend/src`.
Lineas aproximadas: varios.
Que señalar durante la defensa: arbol de carpetas.

Pregunta 6: Muestrame la URL publica y que infraestructura la sirve.
Respuesta recomendada: Si ya esta desplegada, abrir URL Render. Si no, explicar que esta pendiente y mostrar `render.yaml`.
Archivo donde esta la evidencia: `render.yaml`.
Lineas aproximadas: 1-48.
Que señalar durante la defensa: no inventar URL.

Pregunta 7: Cual es exactamente el comando de build y arranque?
Respuesta recomendada: Backend `npm ci && npm run build` y `npm run start`; frontend `cd frontend && npm ci && npm run build`, publish `frontend/dist`.
Archivo donde esta la evidencia: `render.yaml`, package files.
Lineas aproximadas: varios.
Que señalar durante la defensa: buildCommand/startCommand.

Pregunta 8: Que variables necesita y cuales son secretas?
Respuesta recomendada: Ver tabla de variables; secretas: JWT, service role, DATABASE_URL.
Archivo donde esta la evidencia: `.env.example`, `render.yaml`.
Lineas aproximadas: todo.
Que señalar durante la defensa: placeholders y `sync: false`.

Pregunta 9: Donde se almacenan datos y que pasa si recreas el servicio?
Respuesta recomendada: Supabase PostgreSQL; recrear backend/frontend no borra datos porque son servicios externos.
Archivo donde esta la evidencia: `backend/src/config/supabase.ts`, `README.md`.
Lineas aproximadas: varios.
Que señalar durante la defensa: persistencia externa.

Pregunta 10: Como revisas logs y salud despues del deploy?
Respuesta recomendada: Logs en plataforma/backend stdout, health con `/api/health`.
Archivo donde esta la evidencia: `logger.ts`, `server.ts`.
Lineas aproximadas: varios.
Que señalar durante la defensa: curl y logs.

Pregunta 11: Que evento dispara tu proceso automatizado?
Respuesta recomendada: `pull_request`, `push` a `main` y `workflow_dispatch`.
Archivo donde esta la evidencia: `.github/workflows/ci.yml`.
Lineas aproximadas: 1-21.
Que señalar durante la defensa: triggers.

Pregunta 12: Recorre tu pipeline.
Respuesta recomendada: `npm ci`, audit, lint, tests, smoke, build, artefactos y entrega simulada. Cada paso reduce riesgo de fallos antes de publicar.
Archivo donde esta la evidencia: `.github/workflows/reusable-node-validate.yml`.
Lineas aproximadas: pasos.
Que señalar durante la defensa: secuencia de jobs.

Pregunta 13: Que parte sigue manual?
Respuesta recomendada: Deploy real y carga de secrets en plataforma, porque requieren cuenta externa y credenciales.
Archivo donde esta la evidencia: `render.yaml`, este archivo.
Lineas aproximadas: varios.
Que señalar durante la defensa: manual pending.

Pregunta 14: Como garantizas que secretos no terminen expuestos?
Respuesta recomendada: `.env` ignorado, `.env.example` con placeholders, Render `sync: false`, workflows sin imprimir secretos reales.
Archivo donde esta la evidencia: `.gitignore`, `render.yaml`.
Lineas aproximadas: env section.
Que señalar durante la defensa: no mostrar valores reales.

Pregunta 15: Si deploy falla, donde buscas primero?
Respuesta recomendada: Build logs de plataforma, variables faltantes, `npm run start`, `/api/health`, CORS y DB connectivity.
Archivo donde esta la evidencia: README diagnostico, server.
Lineas aproximadas: varios.
Que señalar durante la defensa: orden de diagnostico.

Pregunta 16: Si clono el repo, que necesito?
Respuesta recomendada: Node, npm, copiar env examples, instalar dependencias, configurar Supabase/JWT, correr backend/frontend o Docker.
Archivo donde esta la evidencia: README, `.env.example`.
Lineas aproximadas: varios.
Que señalar durante la defensa: comandos de demo.

Pregunta 17: Si URL responde pero flujo falla, orden de diagnostico?
Respuesta recomendada: health backend, browser network, `VITE_API_*`, CORS, JWT, logs con requestId, Supabase.
Archivo donde esta la evidencia: README Monitoring/Deployment, logger.
Lineas aproximadas: varios.
Que señalar durante la defensa: requestId.

Pregunta 18: Si falta env var, como lo notas y corriges?
Respuesta recomendada: Error en logs/startup o endpoint falla; corregir en plataforma/env local sin subir secretos.
Archivo donde esta la evidencia: `.env.example`, render.
Lineas aproximadas: varios.
Que señalar durante la defensa: variables obligatorias.

Pregunta 19: Que evidencia demuestra que no solo esta levantada sino saludable?
Respuesta recomendada: `/api/health`, flujo login-cita, DB persistence, logs sin errores, CI exitoso.
Archivo donde esta la evidencia: `server.ts`, workflows.
Lineas aproximadas: varios.
Que señalar durante la defensa: health + flujo.

Pregunta 20: Que priorizarias en una iteracion mas?
Respuesta recomendada: Deploy real con URL, alertas reales, DAST, Trivy, cookies HttpOnly para refresh token y errores DB uniformes.
Archivo donde esta la evidencia: `SECURITY_REVIEW.md`, `DEFENSA_MONITORING.md`.
Lineas aproximadas: varios.
Que señalar durante la defensa: pendientes honestos.

## 22. Mapa de Archivos para Defensa

| Tema | Archivo/carpeta | Lineas aproximadas | Que mostrar | Que decir |
|---|---|---:|---|---|
| URL publica/despliegue | `render.yaml` | 1-48 | servicios backend/frontend | "Preparado para Render; falta crear servicios." |
| Package backend | `backend/package.json` | scripts | build/start/test/audit | "Backend compila a dist y arranca con Node." |
| Package frontend | `frontend/package.json` | scripts | build/test/audit | "Frontend genera dist." |
| Build command | `render.yaml` | backend/frontend buildCommand | comandos | "Render puede reproducir build." |
| Start command | `render.yaml`, `backend/Dockerfile` | startCommand/CMD | `npm run start` | "Backend productivo usa dist/server.js." |
| Variables env | `.env.example` | todo | tabla | "Mapa raiz sin secretos reales." |
| Backend env | `backend/.env.example` | todo | placeholders | "Se copia a backend/.env local." |
| Frontend env | `frontend/.env.example` | todo | `VITE_API_*` | "Variables publicas de build." |
| Gitignore | `.gitignore` | env section | `.env` ignorado | "Secretos fuera del repo." |
| DB config | `backend/src/config/supabase.ts` | 1-10 | Supabase client | "Backend usa Supabase." |
| Modelos/entidades | `backend/src/modules/citas/cita.entity.ts` | todo | Cita | "Modelo de citas." |
| Rutas/API | `backend/src/modules/data/data.routes.ts` | varios | endpoints | "Dominio principal." |
| Autenticacion | `backend/src/modules/auth` | varios | bcrypt/JWT | "Login y refresh token." |
| Health | `backend/src/server.ts` | 79-85 | `/api/health` | "Verifica disponibilidad." |
| Logs | `backend/src/utils/logger.ts` | 47-81 | JSON logs | "Logs estructurados." |
| Docker backend | `backend/Dockerfile` | todo | multi-stage | "Imagen productiva." |
| Docker frontend | `frontend/Dockerfile` | todo | Nginx | "Static frontend." |
| Compose | `docker-compose.yml` | todo | stack local | "Demo local reproducible." |
| GitHub Actions | `.github/workflows/ci.yml` | todo | validate/delivery | "Automatizacion." |
| Tests | `*.test.*`, scripts | varios | Vitest | "Tests automatizados." |
| Security | `SECURITY_REVIEW.md` | todo | checklist | "Week 18." |
| Monitoring | `DEFENSA_MONITORING.md` | todo | checklist | "Week 16." |
| README | `README.md` | todo | guia principal | "Documento operativo." |

## 23. Checklist Final de Cumplimiento

| Requisito de Rubrica Final | Cumple | Parcial | No cumple | Evidencia | Correccion hecha | Falta configurar manualmente |
|---|---|---|---|---|---|---|
| URL publica funcional | X |  |  | Frontend/backend Render | URLs agregadas | Ninguno |
| Demo sobre version desplegada |  | X |  | URLs publicas existen | Guia creada | Probar flujo principal y tener usuarios demo |
| Build automatizado | X |  |  | GitHub Actions | CI existente/audit | Ninguno |
| Deploy automatizado |  | X |  | delivery simulation + Render blueprint | Servicios creados en Render | Automatizar deploy final desde main si se requiere |
| Flujo principal funcional |  | X |  | Front/back/routes | Documentado | Probar login/citas en deploy |
| Frontend | X |  |  | `frontend/` build/tests | Ninguna | Configurar `VITE_*` |
| Backend | X |  |  | `backend/` build/tests | Ninguna | Configurar env |
| Base de datos |  | X |  | Supabase config/schema | Docs | Supabase real |
| Autenticacion | X |  |  | auth module | Ninguna | JWT secrets |
| Persistencia |  | X |  | Supabase externo | Docs | DB productiva |
| Logs | X |  |  | logger | Week 16 | Logs cloud |
| Health check | X |  |  | `/api/health` publico | Verificado en Render | Ninguno |
| Variables entorno | X |  |  | env examples | `.env.example` raiz | Cargar valores reales |
| Secretos fuera repo | X |  |  | `.gitignore`, placeholders | Docs | Secret manager/cloud |
| README completo | X |  |  | README | Actualizado | Agregar URL real |
| Pipeline CI/CD | X |  |  | workflows | audit steps | Deploy real |
| Docker | X |  |  | Dockerfiles/compose | Existente | Opcional |
| Testing | X |  |  | Vitest | Existente | Mas tests E2E |
| Diagnostico | X |  |  | README/DEFENSA_FINAL | Creado | Practicar demo |
| Preguntas defensa | X |  |  | este archivo | Creado | Ninguno |

## 24. Configuracion Manual Pendiente

| Tarea manual | Donde se hace | Valor requerido | Es secreto? | Como verificar |
|---|---|---|---|---|
| Crear servicios Render | Render Dashboard | repo + `render.yaml` | No | Servicios activos |
| Configurar URL frontend | Render env/backend CORS | URL frontend real | No | Abre frontend HTTPS |
| Configurar URL backend | Frontend env `VITE_API_*` | URL backend real `/api` | No | Login llama backend |
| Configurar `JWT_ACCESS_SECRET` | Render backend env | secreto fuerte | Si | Backend inicia y login funciona |
| Configurar `JWT_REFRESH_SECRET` | Render backend env | secreto fuerte | Si | Refresh funciona |
| Configurar Supabase | Supabase | proyecto y schema | Parcial | `verify:schema` pasa |
| Configurar `SUPABASE_URL` | Render backend env | URL proyecto | No/semi | Backend conecta |
| Configurar `SUPABASE_ANON_KEY` | Render backend env | anon key | Si en practica | Auth funciona |
| Configurar `SUPABASE_SERVICE_ROLE_KEY` | Render backend env | service key | Si | Scripts/backend funcionan |
| Configurar `DATABASE_URL` | Render backend env | conexion Postgres | Si | schema/seed/DB query |
| Configurar `ALLOWED_ORIGINS` | Render backend env | URL frontend | No | No hay error CORS |
| Configurar GitHub Secrets | GitHub repo settings | tokens si deploy automatizado real | Si | workflow no imprime secretos |
| Ejecutar seed demo | local/backend o Supabase | datos demo | No | usuarios/citas visibles |
| Probar health URL real | terminal | backend URL | No | `status: ok` |
| Revisar logs cloud | Render Dashboard | acceso plataforma | No | logs visibles |

## 25. Comandos para Demostracion

Comando: `npm ci`
Donde ejecutarlo: `backend/` y `frontend/`
Para que sirve: instalar dependencias desde lockfile.
Resultado esperado: instalacion sin errores.

Comando: `npm run build`
Donde ejecutarlo: `backend/`
Para que sirve: compilar backend TypeScript.
Resultado esperado: genera `backend/dist`.

Comando: `npm run start`
Donde ejecutarlo: `backend/`
Para que sirve: iniciar backend productivo.
Resultado esperado: API escuchando en `PORT`.

Comando: `npm run build`
Donde ejecutarlo: `frontend/`
Para que sirve: compilar frontend.
Resultado esperado: genera `frontend/dist`.

Comando: `npm test`
Donde ejecutarlo: `backend/` y `frontend/`
Para que sirve: ejecutar tests.
Resultado esperado: tests pasan.

Comando: `npm run test:smoke`
Donde ejecutarlo: `backend/` y `frontend/`
Para que sirve: verificar estructura critica.
Resultado esperado: smoke pasa.

Comando: `npm run audit`
Donde ejecutarlo: `backend/` y `frontend/`
Para que sirve: revisar vulnerabilidades npm.
Resultado esperado: `found 0 vulnerabilities` o hallazgos documentados.

Comando: `docker compose up --build`
Donde ejecutarlo: raiz.
Para que sirve: levantar stack local.
Resultado esperado: frontend `5174`, backend `3001`.

Comando: `docker compose logs -f backend`
Donde ejecutarlo: raiz.
Para que sirve: ver logs.
Resultado esperado: logs JSON con requestId.

Comando: `curl http://localhost:3001/api/health`
Donde ejecutarlo: raiz con backend local.
Para que sirve: probar health.
Resultado esperado: `status: ok`.

Comando: `curl https://clinicpro-backend-85ho.onrender.com/api/health`
Donde ejecutarlo: terminal.
Para que sirve: verificar deploy.
Resultado esperado: `status: ok`.

Comando: abrir GitHub Actions.
Donde ejecutarlo: GitHub web.
Para que sirve: mostrar pipeline.
Resultado esperado: workflow verde.

## 26. Guia de Demo de 15 a 20 Minutos

Minuto 0-2:

- Abrir README y `DEFENSA_FINAL.md`.
- Decir: "ClinicPRO resuelve gestion clinica interna para admin, medico y recepcion."
- Archivo a mostrar: `README.md`, este archivo.
- Evidencia: problema, stack y flujo.

Minuto 2-6:

- Abrir URL publica si ya existe.
- Si no existe, decir honestamente: "La URL publica esta pendiente; el proyecto esta preparado con Render."
- Mostrar login, dashboard, pacientes/citas.
- Archivo a mostrar: `render.yaml` si falta URL; frontend si demo local.
- Frase: "La demo final debe hacerse con URL real despues de configurar Render."

Minuto 6-9:

- Mostrar arquitectura.
- Archivos: `frontend/src/config/api-config.ts`, `backend/src/server.ts`, `backend/src/config/supabase.ts`, `auth.service.ts`.
- Frase: "Frontend llama al backend; backend autentica, valida y persiste en Supabase."

Minuto 9-12:

- Mostrar deploy/config/logs/health.
- Archivos: `render.yaml`, `.env.example`, `backend/src/server.ts`, `logger.ts`.
- Ejecutar health si hay URL.
- Frase: "Los secretos se cargan fuera del repo y el health check verifica disponibilidad."

Minuto 12-16:

- Mostrar GitHub Actions.
- Archivos: `.github/workflows/ci.yml`, `reusable-node-validate.yml`, `docker-ci.yml`.
- Frase: "El pipeline instala, audita, valida, testea, compila y genera evidencia."

Minuto 16-20:

- Preguntas y diagnostico.
- Mostrar checklist final y pendientes.
- Frase: "Lo que falta no esta inventado: deploy real, URLs reales y configuracion manual de secrets."

## 27. Resultado Final

Cumple completamente:

- Frontend/backend construibles.
- Tests existentes.
- CI de build/test/audit.
- Docker local.
- Health check.
- Logs estructurados.
- Security y monitoring documentados.
- Variables y secretos documentados.

Cumple parcialmente:

- Deploy publico: creado en Render.
- Persistencia: Supabase preparado, requiere credenciales reales.
- Demo final: lista como guia, pero debe ejecutarse sobre URL real.

No cumple aun:

- Demo completa de login/citas sobre version desplegada hasta probarla manualmente.
- Deploy real automatico de punta a punta desde `main` si se exige como produccion formal.

Puntaje estimado sobre 100:

- Con URL publica configurada y health verificado: 85-92.
- Si el flujo login/citas falla durante demo: 75-82 hasta corregir variables, datos demo o CORS.

Que arreglar primero:

1. Verificar que `VITE_API_*` del frontend apunten a `https://clinicpro-backend-85ho.onrender.com/api`.
2. Verificar que `FRONTEND_URL` y `ALLOWED_ORIGINS` del backend apunten a `https://clinicpro-frontend-sph9.onrender.com`.
3. Redeploy frontend si cambiaste variables `VITE_*`.
4. Hacer login y flujo cita en URL publica.
5. Preparar usuarios demo y contrasenas privadas.
