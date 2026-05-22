# Informe de defensa ISW-331 - Semanas 9-14

Proyecto revisado: ClinicPRO  
Fecha de revisión local: 2026-05-20  
Stack detectado: React + Vite + TypeScript en frontend, Express + TypeScript en backend, Supabase PostgreSQL, Docker, GitHub Actions y Vitest.

Nota de revisión: este informe usa evidencia real del repositorio. Las líneas son aproximadas según el estado local actual.

==================================================
1. RESUMEN GENERAL DEL PROYECTO
==================================================

ClinicPRO es un sistema web de gestión clínica interna. Tiene frontend, backend, base de datos externa en Supabase PostgreSQL, autenticación JWT, roles, rutas protegidas, Docker, Docker Compose, CI/CD con GitHub Actions y una suite básica de pruebas automatizadas.

El proyecto está bastante completo para la rúbrica. Sus partes más fuertes son autenticación con roles, Dockerización, pipelines de CI/CD, documentación y testing. Las mejoras urgentes son pequeñas: agregar un `.gitignore` raíz opcional, evitar `synchronize: true` y `logging: true` en configuración TypeORM si se presenta como producción, y asegurar evidencia en GitHub Actions después de subir los últimos cambios locales.

| Área evaluada | Puntaje posible | Estado | Puntaje estimado | Evidencia principal |
|---|---:|---|---:|---|
| Base de datos y autenticación | 20 | Cumple | 18/20 | `backend/src/config/supabase.ts:5-18`, `backend/src/config/init-db.sql:6-226`, `backend/src/modules/auth/auth.service.ts:26-286` |
| Dockerización | 30 | Cumple | 29/30 | `backend/Dockerfile:1-39`, `frontend/Dockerfile:1-30`, `docker-compose.yml:1-39` |
| CI/CD | 30 | Cumple | 29/30 | `.github/workflows/ci.yml:1-59`, `.github/workflows/docker-ci.yml:1-232` |
| Testing | 10 | Cumple | 10/10 | `frontend/src/utils/form-validation.test.ts:15-67`, `backend/src/modules/auth/auth.schema.test.ts:9-83` |
| Defensa técnica | 10 | Cumple | 10/10 | `README.md:1-158`, `README.md:197-345`, `README.md:506-828` |

Puntaje estimado total: 96/100.

==================================================
2. BASE DE DATOS Y AUTENTICACIÓN - 20 PUNTOS
==================================================

## 2.1 Base de datos

Punto evaluado: Base de datos conectada al backend.  
Estado: Cumple.  
Archivo/carpeta: `backend/src/config/supabase.ts`, `backend/src/config/database.ts`, `backend/.env.example`.  
Líneas aproximadas: `supabase.ts:5-18`, `database.ts:8-24`, `.env.example:12-18`.  
Evidencia encontrada: el backend crea un cliente Supabase con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. También existe una configuración TypeORM/Postgres con `DATABASE_URL`.  
Explicación para defensa: "El backend se conecta a Supabase mediante variables de entorno. Para operaciones de API uso Supabase JS; para aplicar/verificar schema uso `DATABASE_URL` con PostgreSQL."  
Qué debo señalar en el código: `backend/src/config/supabase.ts:5-18` y `backend/.env.example:12-18`.  
Pregunta posible: ¿Cómo se conecta tu backend a la base de datos?  
Respuesta sugerida: "Con Supabase JS usando `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`, y con `DATABASE_URL` para scripts SQL."  
Corrección necesaria si aplica: para producción, validar explícitamente que las variables existan antes de crear el cliente.

Punto evaluado: Modelo de datos, tablas y relaciones.  
Estado: Cumple.  
Archivo/carpeta: `backend/src/config/init-db.sql`.  
Líneas aproximadas: `6-140` y compatibilidad/índices en `145-226`.  
Evidencia encontrada: tablas `usuarios`, `sesiones`, `pacientes`, `clinicas`, `especialidades`, `medicos`, `citas`, `expedientes_clinicos`, `consultas_medicas`, `logs`. Hay relaciones: `sesiones.usuario_id -> usuarios`, `pacientes.usuario_id -> usuarios`, `medicos.usuario_id -> usuarios`, `medicos.clinica_id -> clinicas`, `logs.usuario_id -> usuarios`.  
Explicación para defensa: "El modelo separa usuarios internos, sesiones, pacientes, médicos, clínicas, citas y consultas. Las relaciones permiten asociar sesiones a usuarios, médicos a clínicas y registros de auditoría a usuarios."  
Qué debo señalar en el código: `backend/src/config/init-db.sql:6-140`.  
Pregunta posible: ¿Qué entidades principales tiene tu modelo?  
Respuesta sugerida: "Usuarios, sesiones, pacientes, médicos, clínicas, especialidades, citas, expedientes, consultas y logs."  
Corrección necesaria si aplica: algunas columnas de `citas` usan `VARCHAR` en vez de FK real para flexibilidad; si se busca más rigor, convertir a UUID con referencias explícitas.

Punto evaluado: Persistencia, recuperación y CRUD.  
Estado: Cumple.  
Archivo/carpeta: `backend/src/modules/data/data.routes.ts`, `backend/scripts/seed-patients.js`.  
Líneas aproximadas: validaciones `88-163`, pacientes CRUD `218-283`, CRUD genérico `288-345`, dashboard/users `349-450`, citas `453-643`, historial `645-659`, montaje de rutas `662-669`, seed `13-449`.  
Evidencia encontrada: se hacen `select`, `insert`, `update`, `delete` sobre Supabase. Hay datos demo de usuarios, clínicas, médicos, pacientes, citas y consultas.  
Explicación para defensa: "Los endpoints del backend guardan y recuperan datos desde Supabase. Por ejemplo, pacientes tiene GET, POST, PUT y DELETE; citas tiene creación, actualización de estado, notas, edición y borrado según rol."  
Qué debo señalar en el código: `backend/src/modules/data/data.routes.ts:218-283`, `288-345`, `453-643`.  
Pregunta posible: ¿Cómo demuestras que se guardan datos?  
Respuesta sugerida: "Creo un paciente o cita desde la app/API, el backend hace `insert(...).select('*')`, responde con el registro y luego se puede consultar desde Supabase o con GET."  
Corrección necesaria si aplica: agregar tests de integración con Supabase mockeado o DB de prueba ampliaría evidencia.

Punto evaluado: Variables de entorno y ausencia de secretos reales.  
Estado: Cumple.  
Archivo/carpeta: `backend/.env.example`, `frontend/.env.example`, `.dockerignore`, `.gitignore` de backend/frontend.  
Líneas aproximadas: backend `.env.example:1-21`, frontend `.env.example:1-5`, backend `.gitignore:1-8`, frontend `.gitignore:28-31`, `.dockerignore:1-18`.  
Evidencia encontrada: los secretos se documentan como placeholders; `.env` está ignorado en backend/frontend. La búsqueda local no encontró tokens reales versionados; sí hay hashes bcrypt demo en seed, que no son tokens secretos.  
Explicación para defensa: "Las credenciales reales van en `.env`; el repositorio solo tiene `.env.example` con placeholders."  
Qué debo señalar en el código: `backend/.env.example:12-18` y `backend/.gitignore:1-8`.  
Pregunta posible: ¿Dónde manejas credenciales?  
Respuesta sugerida: "En variables de entorno. No subo `.env`, solo la plantilla."  
Corrección necesaria si aplica: agregar `.gitignore` raíz para cubrir `.env` en raíz del repositorio.

## 2.2 Autenticación

Punto evaluado: Login, registro, logout y refresh.  
Estado: Cumple.  
Archivo/carpeta: `backend/src/modules/auth`.  
Líneas aproximadas: rutas `auth.routes.ts:18-25`, controller `14-226`, service `83-286`.  
Evidencia encontrada: `POST /register`, `POST /login`, `POST /refresh`, `POST /logout`, `GET /me`, OAuth Google/Gmail.  
Explicación para defensa: "El controller valida entrada con Zod, el service consulta Supabase, compara hash con bcrypt, genera tokens y registra sesiones."  
Qué debo señalar en el código: `auth.routes.ts:18-25`, `auth.service.ts:100-141`, `217-270`.  
Pregunta posible: ¿Cómo funciona el login?  
Respuesta sugerida: "Valida email/password, busca usuario activo, compara bcrypt, genera access y refresh token y guarda la sesión."  
Corrección necesaria si aplica: ninguna bloqueante.

Punto evaluado: Contraseñas protegidas.  
Estado: Cumple.  
Archivo/carpeta: `backend/src/modules/auth/auth.service.ts`.  
Líneas aproximadas: `100-108` y `132-139`.  
Evidencia encontrada: `bcrypt.hash` en registro y `bcrypt.compare` en login.  
Explicación para defensa: "No guardo contraseñas en texto plano; guardo `password_hash`."  
Qué debo señalar en el código: `auth.service.ts:100-108`.  
Pregunta posible: ¿Por qué tu autenticación es segura a nivel básico?  
Respuesta sugerida: "Porque uso hash bcrypt, JWT con secrets por entorno, refresh token revocable y middleware de autorización."  
Corrección necesaria si aplica: en producción, agregar rate limiting y política de bloqueo por intentos.

Punto evaluado: JWT, sesiones y refresh token rotation.  
Estado: Cumple.  
Archivo/carpeta: `backend/src/utils/jwt.ts`, `backend/src/modules/auth/auth.service.ts`, `frontend/src/services/api-client.ts`.  
Líneas aproximadas: `jwt.ts:10-40`, `auth.service.ts:26-61`, `217-263`, `api-client.ts:47-111`.  
Evidencia encontrada: se generan tokens, se guardan refresh tokens en `sesiones`, se revoca el anterior al refrescar y Axios reintenta tras 401.  
Explicación para defensa: "El access token sirve para autorizar requests; si expira, el refresh token crea una nueva pareja y se revoca el anterior."  
Qué debo señalar en el código: `auth.service.ts:217-263`, `api-client.ts:57-111`.  
Pregunta posible: ¿Qué pasa si expira el access token?  
Respuesta sugerida: "Axios detecta 401, llama a `/auth/refresh`, guarda nuevos tokens y reintenta la petición."  
Corrección necesaria si aplica: ninguna bloqueante.

Punto evaluado: Rutas protegidas y roles.  
Estado: Cumple.  
Archivo/carpeta: backend `middleware`, frontend `layouts/routes`.  
Líneas aproximadas: `server.ts:34-35`, `auth.middleware.ts:12-56`, `role.middleware.ts:4-26`, `ProtectedRoute.tsx:7-37`, `routes.tsx:21-80`.  
Evidencia encontrada: backend protege `/api` con `authMiddleware`, roles con `authorizeRoles`; frontend bloquea rutas por rol y redirige a login/default path.  
Explicación para defensa: "Hay doble protección: frontend evita navegación incorrecta y backend valida token/rol antes de ejecutar recursos privados."  
Qué debo señalar en el código: `backend/src/server.ts:34-35`, `frontend/src/app/layouts/ProtectedRoute.tsx:7-37`.  
Pregunta posible: ¿Qué pasa si un usuario no autenticado entra directo por URL?  
Respuesta sugerida: "Frontend lo manda a login; si intenta llamar API, backend responde 401."  
Corrección necesaria si aplica: ninguna bloqueante.

Preguntas rápidas de base de datos/auth:

1. ¿Cómo se conecta tu backend a la base de datos?  
Respuesta: con Supabase JS y `DATABASE_URL` para scripts. Mostrar `backend/src/config/supabase.ts:5-18`.

2. ¿Dónde está configurada la conexión?  
Respuesta: en `backend/src/config/supabase.ts` y `backend/src/config/database.ts`. Mostrar `database.ts:8-24`.

3. ¿Qué entidades principales tiene tu modelo?  
Respuesta: usuarios, sesiones, pacientes, médicos, clínicas, especialidades, citas, expedientes, consultas y logs. Mostrar `init-db.sql:6-140`.

4. ¿Cómo funciona el login?  
Respuesta: Zod valida, Supabase busca usuario activo, bcrypt compara, JWT genera tokens. Mostrar `auth.controller.ts:41-68` y `auth.service.ts:120-141`.

5. ¿Cómo proteges rutas privadas?  
Respuesta: `authMiddleware` verifica Bearer token y `authorizeRoles` verifica rol. Mostrar `auth.middleware.ts:12-56`, `role.middleware.ts:4-26`.

6. ¿Qué pasa si un usuario no autenticado intenta entrar?  
Respuesta: backend responde 401 y frontend redirige a `/`. Mostrar `ProtectedRoute.tsx:11-13` y `auth.middleware.ts:20-24`.

7. ¿Dónde se manejan las credenciales?  
Respuesta: en `.env`; repo solo tiene `.env.example`. Mostrar `backend/.env.example:12-18`.

8. ¿Qué seguridad básica tiene?  
Respuesta: bcrypt, JWT, refresh token revocable, roles, variables de entorno y rutas protegidas. Mostrar `auth.service.ts:100-141`, `217-270`.

==================================================
3. DOCKERIZACIÓN Y EJECUCIÓN - 30 PUNTOS
==================================================

## 3.1 Dockerfile

Punto evaluado: Dockerfile backend.  
Estado: Cumple.  
Archivo/carpeta: `backend/Dockerfile`.  
Líneas aproximadas: `1-39`.  
Evidencia encontrada: multi-stage con `node:20-alpine`, `npm ci`, target `dev`, target `build`, target `production`, usuario `node`, puerto `3001`, CMD `node dist/server.js`.  
Explicación para defensa: "El backend se construye en etapas: dependencias, desarrollo, build TypeScript y runtime productivo."  
Qué debo señalar: `backend/Dockerfile:1-39`.  
Pregunta posible: ¿Qué hace tu Dockerfile?  
Respuesta sugerida: "Instala dependencias reproducibles, compila TypeScript y prepara una imagen de producción más limpia."  
Corrección necesaria: ninguna bloqueante.

Punto evaluado: Dockerfile frontend.  
Estado: Cumple.  
Archivo/carpeta: `frontend/Dockerfile`.  
Líneas aproximadas: `1-30`.  
Evidencia encontrada: multi-stage con `node:20-alpine` para build y `nginx:1.27-alpine` para servir `dist`. Expone `5174` en dev y `80` en producción.  
Explicación para defensa: "En desarrollo uso Vite; en producción sirvo archivos estáticos con Nginx."  
Qué debo señalar: `frontend/Dockerfile:1-30`.  
Pregunta posible: ¿Por qué usas Nginx en frontend?  
Respuesta sugerida: "Porque el build de Vite produce archivos estáticos; Nginx es ligero para servirlos."  
Corrección necesaria: ninguna bloqueante.

## 3.2 .dockerignore

Punto evaluado: exclusión de archivos innecesarios/sensibles.  
Estado: Cumple.  
Archivo/carpeta: `backend/.dockerignore`, `frontend/.dockerignore`.  
Líneas aproximadas: backend `1-17`, frontend `1-18`.  
Evidencia encontrada: excluye `node_modules`, `dist`, `coverage`, `reports`, `.git`, `.github`, `.env`, logs.  
Explicación para defensa: "Evita copiar dependencias locales, salidas de build, reportes, Git y secretos dentro de la imagen."  
Qué debo señalar: `.dockerignore:1-18`.  
Pregunta posible: ¿Para qué sirve `.dockerignore`?  
Respuesta sugerida: "Reduce tamaño, acelera builds y evita filtrar archivos sensibles como `.env`."  
Corrección necesaria: ninguna.

## 3.3 docker-compose.yml

Punto evaluado: ejecución multi-servicio.  
Estado: Cumple.  
Archivo/carpeta: `docker-compose.yml`.  
Líneas aproximadas: `1-39`.  
Evidencia encontrada: servicios `backend` y `frontend`, contenedores `clinicpro_backend` y `clinicpro_frontend`, puertos `3001:3001` y `5174:5174`, volumen de código, `env_file` backend, `depends_on` frontend -> backend.  
Explicación para defensa: "Compose levanta frontend y backend con un solo comando; el backend toma `.env` y el frontend depende del backend."  
Qué debo señalar: `docker-compose.yml:3-39`.  
Pregunta posible: ¿Qué servicios se levantan?  
Respuesta sugerida: "Backend Express en 3001 y frontend Vite en 5174. La base de datos está en Supabase externo."  
Corrección necesaria: si se quisiera ambiente 100% local, agregar Postgres local; para este proyecto Supabase externo es válido.

## 3.4 Ejecución

Comandos exactos:

- Levantar todo: `docker compose up --build` en raíz.
- Detener: `docker compose down` en raíz.
- Logs: `docker compose logs -f backend` o `docker compose logs -f frontend`.
- URL frontend: `http://localhost:5174`.
- URL backend: `http://localhost:3001`.
- Build producción frontend: `docker build -t clinicpro-frontend ./frontend`.
- Run producción frontend: `docker run --rm -p 5174:80 clinicpro-frontend`.
- Build producción backend: `docker build -t clinicpro-backend ./backend`.
- Run producción backend: `docker run --rm --env-file backend/.env -p 3001:3001 clinicpro-backend`.

Preguntas de Docker:

1. ¿Para qué usaste Docker?  
Respuesta: para reproducir frontend/backend sin depender del entorno local. Mostrar Dockerfiles.

2. ¿Qué hace docker-compose.yml?  
Respuesta: levanta ambos servicios, puertos y volúmenes. Mostrar `docker-compose.yml:3-39`.

3. ¿Cómo se comunican backend y base de datos?  
Respuesta: backend se conecta a Supabase externo con variables de entorno. Mostrar `supabase.ts:5-18`.

4. ¿Qué problema resuelve Docker?  
Respuesta: evita errores por versiones distintas de Node/dependencias y facilita demo reproducible.

==================================================
4. PIPELINE DE CI/CD - 30 PUNTOS
==================================================

## 4.1 Workflows

Punto evaluado: carpeta y workflows.  
Estado: Cumple.  
Archivo/carpeta: `.github/workflows/`.  
Líneas aproximadas: `ci.yml:1-59`, `reusable-node-validate.yml:1-74`, `docker-ci.yml:1-232`.  
Evidencia encontrada: existen `CI Pipeline`, `Reusable Node Validation` y `Dockerized CI`.  
Explicación para defensa: "Tengo un pipeline base para validar frontend/backend y otro Dockerizado para construir imágenes y simular delivery."  
Qué debo señalar: `.github/workflows/ci.yml:1-20` y `.github/workflows/docker-ci.yml:1-20`.

Eventos:

- Pull request: `ci.yml:4-10`, `docker-ci.yml:4-10`.
- Push a main: `ci.yml:11-19`, `docker-ci.yml:11-19`.
- Manual: `workflow_dispatch` en `ci.yml:20`, `docker-ci.yml:20`.

## 4.2 Validaciones

Punto evaluado: checkout, runtime, install, lint, tests, build, artifacts.  
Estado: Cumple.  
Archivo/carpeta: `.github/workflows/reusable-node-validate.yml`.  
Líneas aproximadas: `37-74`.  
Evidencia encontrada: checkout, setup-node, cache npm, `npm ci`, lint, test, upload JUnit, build y upload build artifact.  
Explicación para defensa: "Cada cambio instala dependencias desde lockfile, ejecuta calidad, pruebas, build y genera artefactos."  
Qué debo señalar: `reusable-node-validate.yml:37-74`.  
Qué pasa si falla algo: como no usa `|| true`, el job falla y `delivery` no corre por `needs`.

## 4.3 Buenas prácticas

Estado: Cumple.  
Evidencia:

- Permissions mínimos: `ci.yml:22-23`, `docker-ci.yml:22-23`.
- Concurrency: `ci.yml:25-27`, `docker-ci.yml:25-27`.
- Matrix: `ci.yml:32-42`, `reusable-node-validate.yml:27-30`.
- Cache npm: `reusable-node-validate.yml:40-45`.
- Needs: `ci.yml:51`, `docker-ci.yml:134`, `224`.
- Environment production: `ci.yml:52`, `docker-ci.yml:225`.
- Docker Buildx: `docker-ci.yml:170-171`.
- Docker build-push: `docker-ci.yml:181-201`.
- Tags con SHA: `docker-ci.yml:147-168`.
- Secrets/GITHUB_TOKEN: `docker-ci.yml:173-179`.
- Artefactos: `reusable-node-validate.yml:56-74`, `docker-ci.yml:83-129`, `213-219`.

## 4.4 Estructura del pipeline

Jobs:

- `validate`: valida frontend/backend.
- `delivery`: depende de `validate`.
- En Dockerized CI: `validate` -> `build-image` -> `deploy-simulation`.

Evidencia a mostrar en GitHub Actions:

- Ejecución de `CI Pipeline`.
- Logs de `Run quality checks`, `Run tests`, `Build project`.
- Artefactos de build.
- Ejecución de `Dockerized CI`.
- Artefacto `docker-image-evidence`.
- Job `deploy-simulation` después de `build-image`.

Preguntas CI/CD:

1. ¿Qué es CI/CD en tu proyecto?  
Respuesta: validación automática de lint, tests, build y entrega simulada. Mostrar `ci.yml`.

2. ¿Cuándo se activa?  
Respuesta: PR, push a main y manual. Mostrar `ci.yml:3-20`.

3. ¿Qué valida?  
Respuesta: dependencias, lint, tests, build y artefactos. Mostrar `reusable-node-validate.yml:47-74`.

4. ¿Qué pasa si fallan los tests?  
Respuesta: falla `validate`, no corre delivery. Mostrar `ci.yml:48-52`.

5. ¿Por qué separaste jobs?  
Respuesta: para que entrega dependa de validación exitosa. Mostrar `needs`.

6. ¿Para qué sirve `workflow_dispatch`?  
Respuesta: ejecutar manualmente desde Actions. Mostrar `ci.yml:20`.

7. ¿Qué parte construye Docker?  
Respuesta: `docker-ci.yml` job `build-image`, líneas `131-201`.

==================================================
5. TESTING Y CALIDAD TÉCNICA - 10 PUNTOS
==================================================

## 5.1 Tests existentes

Estado: Cumple.  
Herramientas: Vitest, Testing Library, jsdom, coverage-v8.  
Configuración: `frontend/vitest.config.ts:1-17`, `backend/vitest.config.ts:1-14`.  
Comandos: `frontend/package.json:21-23`, `backend/package.json:7-10`.  
Cantidad validada localmente: 23 tests, 16 frontend y 7 backend.

## 5.2 Clasificación de tests

| Test | Tipo | Líneas | Qué prueba | Happy/failure | Relevancia |
|---|---|---:|---|---|---|
| `frontend/src/utils/form-validation.test.ts` | Unit | 15-67 | Helpers de nombres, dígitos, email, teléfono y fechas | Ambos | Evita datos inválidos en formularios |
| `frontend/src/utils/roles.test.ts` | Unit | 4-26 | Redirección por rol y normalización | Ambos | Evita rutas incorrectas por rol |
| `backend/src/modules/auth/auth.schema.test.ts` | Unit | 9-83 | Schemas Zod de auth, roles, password, Gmail | Ambos | Evita payloads inválidos en auth |
| `frontend/src/app/layouts/ProtectedRoute.test.tsx` | Integration | 39-88 | RoleProtectedRoute + Router + Auth mock | Ambos | Evita acceso incorrecto en UI |

## 5.3 Requisitos mínimos

- Mínimo 5 unit tests: cumple, hay 20 unit tests.
- Casos exitosos: cumple.
- Casos de error: cumple.
- Ejecutables localmente: cumple con `npm test`.
- Ejecutados en Actions: cumple en `reusable-node-validate.yml:53-63` y `docker-ci.yml:79-115`.
- No triviales: cumple, validan reglas de negocio y acceso.

Preguntas Testing:

1. ¿Qué pruebas tiene tu proyecto?  
Respuesta: unitarias de validación/roles/auth e integración de ruta protegida. Mostrar tests.

2. ¿Cómo ejecuto tus tests?  
Respuesta: `cd frontend && npm test`; `cd backend && npm test`. Mostrar package scripts.

3. ¿Qué es un unit test?  
Respuesta: prueba una función o regla aislada. Ejemplo `form-validation.test.ts`.

4. ¿Qué es un integration test?  
Respuesta: prueba interacción entre partes. Ejemplo `ProtectedRoute` con Router y Auth.

5. ¿Dónde corren en Actions?  
Respuesta: `Run tests` en workflows. Mostrar `reusable-node-validate.yml:53-63`.

==================================================
6. EXPLICACIÓN TÉCNICA Y CRITERIO PROFESIONAL - 10 PUNTOS
==================================================

Explicación recomendada:

"ClinicPRO usa Supabase PostgreSQL para persistir información clínica y administrativa. El backend Express implementa autenticación JWT, refresh tokens y control por roles para proteger recursos. El frontend React consume el backend con Axios, guarda sesión localmente y redirige según perfil. Docker permite ejecutar frontend y backend de forma reproducible. GitHub Actions automatiza instalación, lint, tests, build, artefactos y construcción de imágenes. Los tests con Vitest validan comportamientos importantes para evitar regresiones. El README documenta cómo configurar, ejecutar, probar y defender el proyecto."

Revisión README:

- Qué hace el proyecto: cumple `README.md:1-25`.
- Stack: cumple `27-53`.
- Roles: cumple `55-72`.
- Funcionalidades: cumple `74-158`.
- Docker: cumple `197-242`.
- Variables: cumple `244-267`.
- Base de datos/modelo/auth: cumple `269-345`.
- Endpoints: cumple `442-478`.
- Scripts: cumple `480-504`.
- CI/CD: cumple `506-687`.
- Testing: cumple `689-778`.
- Defensa: cumple `780-828`.

Texto adicional sugerido si se quiere mejorar README:

```md
## Limitaciones actuales

- La base de datos productiva está en Supabase, por lo que la demo requiere conexión a internet.
- El pipeline usa secrets simulados para CI; las migraciones reales se ejecutan manualmente desde backend.
- Las acciones de GitHub usan tags versionados por legibilidad académica; en producción estricta se recomienda fijarlas por SHA.
```

==================================================
7. MAPA DE ARCHIVOS PARA DEFENSA
==================================================

| Tema de defensa | Archivo/carpeta | Líneas aproximadas | Qué debo mostrar | Qué debo decir |
|---|---|---:|---|---|
| Problema y objetivo | `README.md` | 1-25 | Problemática y objetivo | El sistema centraliza operación clínica interna |
| Stack | `README.md` | 27-53 | Tecnologías | React, Express, TS, Supabase, Docker |
| Base de datos | `backend/src/config/supabase.ts` | 5-18 | Cliente Supabase | Conecta por env vars |
| Schema | `backend/src/config/init-db.sql` | 6-140 | Tablas | Modelo clínico y auth |
| Scripts DB | `backend/scripts/*.js` | apply 1-34, verify 1-51 | Schema/seed | Aplica, verifica y carga demo |
| Auth routes | `backend/src/modules/auth/auth.routes.ts` | 18-25 | Endpoints auth | Login, register, refresh, logout, me |
| Auth service | `backend/src/modules/auth/auth.service.ts` | 26-286 | Lógica auth | bcrypt, JWT, sesiones |
| JWT | `backend/src/utils/jwt.ts` | 10-40 | Firma/verificación | Tokens con secrets |
| Middleware | `backend/src/middleware` | auth 12-56, role 4-26 | Protección | 401/403 por token/rol |
| API protegida | `backend/src/server.ts` | 34-35 | Montaje rutas | `/api` protegido |
| CRUD datos | `backend/src/modules/data/data.routes.ts` | 218-669 | CRUD y roles | Supabase select/insert/update/delete |
| Rutas frontend | `frontend/src/app/routes.tsx` | 21-80 | Rutas por rol | admin/doctor/reception |
| ProtectedRoute | `frontend/src/app/layouts/ProtectedRoute.tsx` | 7-37 | Bloqueo UI | Sin sesión a login |
| AuthContext | `frontend/src/context/AuthContext.tsx` | 34-115 | Sesión frontend | login/logout/session state |
| Interceptor Axios | `frontend/src/services/api-client.ts` | 47-111 | Authorization/refresh | Bearer + auto refresh |
| Docker backend | `backend/Dockerfile` | 1-39 | Multi-stage | Node build/runtime |
| Docker frontend | `frontend/Dockerfile` | 1-30 | Multi-stage | Vite build + Nginx |
| Docker ignore | `backend/.dockerignore`, `frontend/.dockerignore` | 1-18 | Exclusiones | No copiar `.env`, node_modules |
| Compose | `docker-compose.yml` | 1-39 | Servicios | backend/frontend/puertos |
| CI principal | `.github/workflows/ci.yml` | 1-59 | Eventos/jobs | PR, main, manual, validate/delivery |
| Reusable CI | `.github/workflows/reusable-node-validate.yml` | 37-74 | npm ci/lint/test/build | Validación Node |
| Docker CI | `.github/workflows/docker-ci.yml` | 29-232 | validate/build-image/deploy | Imágenes + evidencia |
| Tests frontend | `frontend/src/**/*.test.ts(x)` | varias | 16 tests | validaciones, roles, ruta protegida |
| Tests backend | `backend/src/modules/auth/auth.schema.test.ts` | 9-83 | 7 tests | Zod auth |
| README defensa | `README.md` | 780-828 | Defensa técnica | Guion demo y preguntas |

==================================================
8. PREGUNTAS Y RESPUESTAS PARA DEFENSA
==================================================

1. Pregunta: ¿Qué problema resuelve ClinicPRO?  
Respuesta recomendada: Centraliza gestión clínica interna y separa responsabilidades por rol.  
Dónde señalar: README.  
Archivo: `README.md`  
Líneas aproximadas: 7-25.  
Comentario: conecta el proyecto con la problemática.

2. Pregunta: ¿Qué stack usaste?  
Respuesta recomendada: React/Vite/TS, Express/TS, Supabase PostgreSQL, Docker y GitHub Actions.  
Archivo: `README.md`  
Líneas: 27-53.  
Comentario: mostrar visión técnica completa.

3. Pregunta: ¿Qué base de datos usas?  
Respuesta: Supabase PostgreSQL.  
Archivo: `README.md`, `backend/src/config/supabase.ts`  
Líneas: README 48-49, supabase 5-18.  
Comentario: Supabase es Postgres administrado.

4. Pregunta: ¿Dónde está la conexión?  
Respuesta: en `supabase.ts` con env vars y `database.ts` con `DATABASE_URL`.  
Archivo: `backend/src/config/supabase.ts`  
Líneas: 5-18.  
Comentario: no hay credenciales hardcodeadas.

5. Pregunta: ¿Qué tablas existen?  
Respuesta: usuarios, sesiones, pacientes, médicos, clínicas, especialidades, citas, expedientes, consultas, logs.  
Archivo: `backend/src/config/init-db.sql`  
Líneas: 6-140.  
Comentario: mostrar schema.

6. Pregunta: ¿Cómo se guarda un paciente?  
Respuesta: ruta POST valida payload y hace insert en Supabase.  
Archivo: `backend/src/modules/data/data.routes.ts`  
Líneas: 234-248.  
Comentario: evidencia de persistencia.

7. Pregunta: ¿Cómo recuperas datos?  
Respuesta: rutas GET usan `select('*')` y ordenan por fecha/created_at.  
Archivo: `data.routes.ts`  
Líneas: 218-231, 292-305, 453-456.  
Comentario: evidencia de lectura.

8. Pregunta: ¿Cómo funciona login?  
Respuesta: valida Zod, busca usuario activo, compara bcrypt y crea tokens.  
Archivo: `auth.controller.ts`, `auth.service.ts`  
Líneas: controller 41-68, service 120-141.  
Comentario: explicar flujo en 30 segundos.

9. Pregunta: ¿Dónde proteges password?  
Respuesta: con bcrypt hash/compare.  
Archivo: `auth.service.ts`  
Líneas: 100-108, 132-139.  
Comentario: no texto plano.

10. Pregunta: ¿Qué usa JWT?  
Respuesta: `jwt.ts` firma y verifica access/refresh tokens con secrets.  
Archivo: `backend/src/utils/jwt.ts`  
Líneas: 10-40.  
Comentario: mostrar secrets por env.

11. Pregunta: ¿Cómo proteges endpoints?  
Respuesta: `authMiddleware` valida Bearer y `authorizeRoles` valida rol.  
Archivo: `backend/src/middleware`  
Líneas: auth 12-56, role 4-26.  
Comentario: 401 vs 403.

12. Pregunta: ¿Cómo evitas que un médico entre a admin?  
Respuesta: frontend `RoleProtectedRoute` y backend `authorizeRoles('admin')`.  
Archivo: `routes.tsx`, `data.routes.ts`  
Líneas: routes 26-29, data 349, 383.  
Comentario: doble capa.

13. Pregunta: ¿Qué hace recepción?  
Respuesta: gestiona citas y pacientes, pero no médicos/clinicas/especialidades ni completadas.  
Archivo: `data.routes.ts`, `README.md`  
Líneas: data 549-618, 662-668; README 96-104.  
Comentario: rol limitado.

14. Pregunta: ¿Qué hace Docker?  
Respuesta: empaqueta backend/frontend en entornos reproducibles.  
Archivo: `backend/Dockerfile`, `frontend/Dockerfile`  
Líneas: completas.  
Comentario: demostrar multi-stage.

15. Pregunta: ¿Qué hace Compose?  
Respuesta: levanta backend y frontend con puertos y volúmenes.  
Archivo: `docker-compose.yml`  
Líneas: 1-39.  
Comentario: comando único.

16. Pregunta: ¿Dónde está CI/CD?  
Respuesta: `.github/workflows/ci.yml` y `docker-ci.yml`.  
Archivo: `.github/workflows/ci.yml`  
Líneas: 1-59.  
Comentario: mostrar pestaña Actions.

17. Pregunta: ¿Cuándo corre el pipeline?  
Respuesta: PR, push a main y manual.  
Archivo: `ci.yml`  
Líneas: 3-20.  
Comentario: cumple rúbrica.

18. Pregunta: ¿Qué valida CI?  
Respuesta: `npm ci`, lint, tests, build y artifacts.  
Archivo: `reusable-node-validate.yml`  
Líneas: 47-74.  
Comentario: no oculta errores.

19. Pregunta: ¿Qué es matrix build?  
Respuesta: prueba Node 20 y 22.  
Archivo: `reusable-node-validate.yml`  
Líneas: 27-30.  
Comentario: compatibilidad runtime.

20. Pregunta: ¿Qué pasa si falla validate?  
Respuesta: no corre delivery/build-image por `needs`.  
Archivo: `ci.yml`, `docker-ci.yml`  
Líneas: ci 48-52, docker 131-135.  
Comentario: separación profesional.

21. Pregunta: ¿Qué imagen Docker genera CI?  
Respuesta: `ghcr.io/<repo>-frontend:<sha>` y backend.  
Archivo: `docker-ci.yml`  
Líneas: 147-168.  
Comentario: trazabilidad por commit.

22. Pregunta: ¿Qué tests tienes?  
Respuesta: 23 tests, unitarios e integración.  
Archivo: tests y README.  
Líneas: README 689-778.  
Comentario: decir 16 frontend, 7 backend.

23. Pregunta: ¿Qué casos de error cubres?  
Respuesta: rol inválido, password débil, email malformado, fecha futura, usuario no autenticado.  
Archivo: tests.  
Líneas: varios.  
Comentario: conecta con riesgos reales.

24. Pregunta: ¿Dónde se ejecutan tests en CI?  
Respuesta: `Run tests`.  
Archivo: `reusable-node-validate.yml`, `docker-ci.yml`  
Líneas: reusable 53-63, docker 79-115.  
Comentario: mostrar logs y artefactos JUnit.

25. Pregunta: ¿Qué mejorarías con más tiempo?  
Respuesta: tests de integración con DB de prueba, migraciones formales, rate limiting, branch protection real y acciones fijadas por SHA.  
Archivo: `database.ts`, workflows.  
Líneas: database 11-12, README 575-577.  
Comentario: muestra criterio profesional.

26. Pregunta: ¿Por qué no hay login de paciente?  
Respuesta: el alcance es sistema interno; pacientes son registros clínicos.  
Archivo: `README.md`  
Líneas: 25, 72.  
Comentario: responde una duda funcional común.

27. Pregunta: ¿Dónde están las variables del frontend?  
Respuesta: `frontend/.env.example` y `api-config.ts`.  
Archivo: `frontend/src/config/api-config.ts`  
Líneas: 1-5.  
Comentario: Vite lee `VITE_*`.

28. Pregunta: ¿Cómo verificas schema?  
Respuesta: con `npm run verify:schema`, que consulta tablas requeridas.  
Archivo: `backend/scripts/verify-supabase-schema.js`  
Líneas: 7-51.  
Comentario: buena evidencia de base de datos.

29. Pregunta: ¿Dónde están los datos demo?  
Respuesta: `seed-patients.js` y `sample-patients.sql`.  
Archivo: `backend/scripts/seed-patients.js`  
Líneas: 13-449.  
Comentario: permite demo con datos.

30. Pregunta: ¿Cómo demuestras delivery?  
Respuesta: con job `delivery` y `deploy-simulation`, que corren solo después de validar.  
Archivo: `ci.yml`, `docker-ci.yml`  
Líneas: ci 48-59, docker 221-232.  
Comentario: no despliega peligroso.

==================================================
9. CHECKLIST FINAL DE CUMPLIMIENTO
==================================================

| Punto de la rúbrica | Cumple | Parcial | No cumple | Evidencia | Corrección recomendada |
|---|---|---|---|---|---|
| Base de datos funcional | X |  |  | `supabase.ts:5-18`, `init-db.sql` | Validar env vars al arrancar |
| Persistencia | X |  |  | `data.routes.ts:234-248`, `308-318` | Agregar tests CRUD |
| Recuperación | X |  |  | `data.routes.ts:218-231`, `292-305` | Ninguna |
| CRUD | X |  |  | `data.routes.ts:218-345`, `453-643` | Ninguna |
| Autenticación | X |  |  | `auth.routes.ts:18-25` | Ninguna |
| Password protegida | X |  |  | `auth.service.ts:100-108` | Ninguna |
| Refresh/logout | X |  |  | `auth.service.ts:217-270` | Ninguna |
| Protección de rutas backend | X |  |  | `server.ts:34-35`, middleware | Ninguna |
| Protección de rutas frontend | X |  |  | `ProtectedRoute.tsx:7-37` | Ninguna |
| Variables de entorno | X |  |  | `.env.example` | Agregar `.gitignore` raíz opcional |
| Sin secretos reales | X |  |  | `.gitignore`, búsqueda local | Revisar antes de cada push |
| Dockerfile backend | X |  |  | `backend/Dockerfile:1-39` | Ninguna |
| Dockerfile frontend | X |  |  | `frontend/Dockerfile:1-30` | Ninguna |
| .dockerignore | X |  |  | ambos `.dockerignore` | Ninguna |
| docker-compose | X |  |  | `docker-compose.yml:1-39` | Ninguna |
| Ejecución Docker | X |  |  | `docker compose config --quiet` OK | Probar demo completa antes de defensa |
| CI pull_request/main/manual | X |  |  | `ci.yml:3-20` | Ninguna |
| CI lint/tests/build | X |  |  | `reusable-node-validate.yml:47-74` | Ninguna |
| Docker CI imagen | X |  |  | `docker-ci.yml:181-201` | Ninguna |
| Artefactos | X |  |  | workflows upload-artifact | Ninguna |
| Buenas prácticas CI | X |  |  | permissions/concurrency/cache/matrix/needs | Fijar actions por SHA en producción |
| Tests locales | X |  |  | package scripts | Ninguna |
| Tests en CI | X |  |  | workflows test steps | Ninguna |
| README | X |  |  | `README.md:1-828` | Agregar limitaciones actuales |
| Defensa técnica | X |  |  | `README.md:780-828` | Ninguna |

==================================================
10. CORRECCIONES PRIORITARIAS
==================================================

Alta prioridad:

- Archivo: no existe `.gitignore` raíz.
  Líneas: no aplica.
  Cambio: crear `.gitignore` raíz con `.env`, `.env.*`, `node_modules/`, `dist/`, `coverage/`, `reports/`, logs.
  Por qué mejora nota: reduce riesgo de subir secretos o artefactos desde raíz.
  Verificar: `git status --ignored --short`.

- Archivo: GitHub Actions en GitHub.
  Líneas: no aplica.
  Cambio: hacer commit/push de cambios locales y mostrar ejecución exitosa en Actions.
  Por qué mejora nota: da evidencia visible real para defensa.
  Verificar: pestaña Actions en GitHub.

Media prioridad:

- Archivo: `backend/src/config/database.ts`.
  Líneas: 11-12.
  Cambio: poner `synchronize: false` y `logging: false` para producción, o condicionar con `NODE_ENV`.
  Por qué mejora nota: muestra criterio profesional sobre DB.
  Verificar: `cd backend && npm run build`.

- Archivo: `backend/src/config/supabase.ts`.
  Líneas: 5-12.
  Cambio: lanzar error claro si faltan `SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY`.
  Por qué mejora nota: evita fallos confusos.
  Verificar: `cd backend && npm run build`.

- Archivo: tests.
  Líneas: no aplica.
  Cambio: agregar tests de rutas data con Supabase mockeado.
  Por qué mejora nota: refuerza CRUD/persistencia.
  Verificar: `npm test`.

Baja prioridad:

- Archivo: `.github/workflows/*.yml`.
  Cambio: fijar actions por SHA.
  Por qué mejora nota: seguridad avanzada.
  Verificar: Actions corre igual.

- Archivo: frontend.
  Cambio: code-splitting para warning de bundle grande.
  Por qué mejora nota: performance profesional.
  Verificar: `cd frontend && npm run build`.

==================================================
11. COMANDOS PARA DEMOSTRACIÓN
==================================================

Comando: `cd backend && npm ci`  
Dónde ejecutarlo: raíz del repo.  
Para qué sirve: instalar dependencias backend reproducibles.  
Resultado esperado: instalación sin errores.

Comando: `cd frontend && npm ci`  
Dónde ejecutarlo: raíz del repo.  
Para qué sirve: instalar dependencias frontend reproducibles.  
Resultado esperado: instalación sin errores.

Comando: `cd backend && npm run dev`  
Dónde ejecutarlo: backend.  
Para qué sirve: iniciar API local.  
Resultado esperado: backend en `http://localhost:3001`.

Comando: `cd frontend && npm run dev`  
Dónde ejecutarlo: frontend.  
Para qué sirve: iniciar Vite.  
Resultado esperado: frontend en `http://localhost:5174`.

Comando: `cd backend && npm test`  
Dónde ejecutarlo: backend.  
Para qué sirve: ejecutar tests backend.  
Resultado esperado: 7 tests passing.

Comando: `cd frontend && npm test`  
Dónde ejecutarlo: frontend.  
Para qué sirve: ejecutar tests frontend.  
Resultado esperado: 16 tests passing.

Comando: `cd backend && npm run build`  
Dónde ejecutarlo: backend.  
Para qué sirve: compilar TypeScript.  
Resultado esperado: build sin errores.

Comando: `cd frontend && npm run build`  
Dónde ejecutarlo: frontend.  
Para qué sirve: compilar app Vite.  
Resultado esperado: `dist/` generado.

Comando: `docker compose up --build`  
Dónde ejecutarlo: raíz.  
Para qué sirve: levantar backend y frontend con Docker.  
Resultado esperado: `clinicpro_backend` y `clinicpro_frontend` corriendo.

Comando: `docker compose down`  
Dónde ejecutarlo: raíz.  
Para qué sirve: detener contenedores.  
Resultado esperado: contenedores detenidos.

Comando: `docker compose logs -f backend`  
Dónde ejecutarlo: raíz.  
Para qué sirve: ver logs backend.  
Resultado esperado: logs de Express/tsx.

Comando: `docker compose logs -f frontend`  
Dónde ejecutarlo: raíz.  
Para qué sirve: ver logs frontend.  
Resultado esperado: logs de Vite.

Comando: `cd backend && npm run apply:schema`  
Dónde ejecutarlo: backend.  
Para qué sirve: aplicar schema SQL a Supabase.  
Resultado esperado: "Schema applied successfully."

Comando: `cd backend && npm run verify:schema`  
Dónde ejecutarlo: backend.  
Para qué sirve: comprobar tablas requeridas.  
Resultado esperado: tablas con OK.

Comando: `cd backend && npm run seed:demo`  
Dónde ejecutarlo: backend.  
Para qué sirve: cargar datos demo.  
Resultado esperado: registros cargados por tabla.

Comando: `docker build -t clinicpro-frontend ./frontend`  
Dónde ejecutarlo: raíz.  
Para qué sirve: construir imagen frontend.  
Resultado esperado: imagen creada.

Comando: `docker build -t clinicpro-backend ./backend`  
Dónde ejecutarlo: raíz.  
Para qué sirve: construir imagen backend.  
Resultado esperado: imagen creada.

Comando: abrir GitHub > Actions > `CI Pipeline` y `Dockerized CI`.  
Dónde ejecutarlo: navegador.  
Para qué sirve: evidenciar CI/CD.  
Resultado esperado: jobs exitosos, logs y artefactos.

==================================================
12. CIERRE
==================================================

Puntaje estimado total: 96/100.

Puntos más fuertes:

- Autenticación JWT con refresh token rotation.
- Roles protegidos en frontend y backend.
- Dockerfiles multi-stage y Docker Compose funcional.
- GitHub Actions con matrix, cache, artifacts, Docker Buildx y delivery simulado.
- Tests relevantes con casos felices y de error.
- README muy defendible.

Puntos más débiles:

- No hay `.gitignore` raíz.
- `database.ts` conserva `synchronize: true` y `logging: true`.
- Faltan tests de integración de CRUD/backend con Supabase mockeado o DB de prueba.
- La base de datos depende de Supabase externo; la demo requiere conexión y `.env` correcto.

Qué arreglar primero:

1. Crear `.gitignore` raíz.
2. Cambiar `database.ts` para producción.
3. Hacer commit/push de cambios locales.
4. Confirmar una ejecución exitosa de GitHub Actions.

Qué mostrar en 15-20 minutos:

1. README: problemática, stack y roles.
2. Docker Compose levantando frontend/backend.
3. Login con rol admin/medico/recepcionista.
4. CRUD o consulta de pacientes/citas.
5. Supabase mostrando tablas/datos.
6. Código de auth/middleware/roles.
7. Tests locales pasando.
8. GitHub Actions con pipelines y artefactos.
