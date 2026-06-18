# DEFENSA Week 15 - Cloud Foundations and Deployment

Auditoria realizada sobre el proyecto real `ClinicPRO` el 2026-06-07.
No se inventan evidencias: cuando algo no existe en archivos del proyecto, se marca como falta.

## Actualizacion Aplicada

Despues de la auditoria inicial se agregaron correcciones para cubrir los puntos faltantes de Week 15:

- Configuracion cloud en `render.yaml` para backend Node.js y frontend static en Render.
- Health check real en el entrypoint productivo `backend/src/server.ts` con `GET /api/health`.
- CORS preparado para produccion con `ALLOWED_ORIGINS` y `FRONTEND_URL`.
- Variables faltantes documentadas: `ALLOWED_ORIGINS` y `HISTORIAL_API_URL`.
- README actualizado con seccion "Despliegue Cloud - Week 15", checklist post-deploy, secretos, comandos y fallos comunes.
- GitHub Actions ahora ejecuta `npm run test:smoke --if-present`.
- Tests frontend corregidos para ejecutarse en modo test aunque el shell tenga `NODE_ENV=production`.

Pendiente real que no se puede inventar desde el codigo: crear los servicios en Render y copiar las URLs publicas HTTPS generadas.

## 1. Identificacion del Tipo de Proyecto

- Tecnologia principal: JavaScript/TypeScript con Node.js.
- Framework: frontend React 18 + Vite; backend Express + TypeScript.
- Frontend: si, en `frontend/`. Evidencia: `frontend/package.json:6-26`, `README.md:31-39`.
- Backend: si, en `backend/`. Evidencia: `backend/package.json:5-16`, `README.md:41-48`.
- Base de datos: Supabase PostgreSQL. Evidencia: `README.md:50-51`, `backend/src/config/supabase.ts:5-18`, `backend/src/config/database.ts:7-22`.
- Docker: si, `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`.
- GitHub Actions: si, `.github/workflows/ci.yml`, `.github/workflows/docker-ci.yml`, `.github/workflows/reusable-node-validate.yml`.
- Configuracion para produccion: parcial-alta. Hay Dockerfiles multi-stage, build/start, health check, CORS por variables, CI y `render.yaml`; falta ejecutar el deploy real y documentar las URLs generadas.
- README: si, `README.md`.
- `.env.example`: si, `backend/.env.example` y `frontend/.env.example`.
- Archivos de despliegue cloud: `render.yaml`.
- Plataforma cloud encontrada: Supabase para base de datos y Render como plataforma preparada para frontend/backend.
- Estado general del despliegue: Parcial-alto. El proyecto esta preparado para desplegar, pero todavia no demuestra una URL publica real ya publicada.

## 2. URL Publica y Plataforma Cloud

Punto evaluado: URL publica de la aplicacion.
Estado: No cumple.
Archivo encontrado: no se encontro URL publica de frontend/backend.
Lineas aproximadas: `README.md:199-244` solo documenta `localhost`; `README.md:506-688` documenta CI/CD y deploy simulado.
Evidencia: `README.md:208` usa `http://localhost:5174`; `README.md:214` usa `http://localhost:3001`; `ci.yml:55-59` dice que la entrega es simulada; `docker-ci.yml:221-232` dice que no se ejecuta despliegue real.
Que debo decir en defensa: "El proyecto todavia no esta desplegado publicamente. Tengo build, Docker, CI y simulacion de delivery, pero falta publicar frontend/backend en una plataforma cloud y documentar la URL."
Correccion recomendada: desplegar frontend en Vercel/Netlify/Render Static Site y backend en Render/Railway/Fly.io/Azure App Service; documentar URL publica HTTPS, plataforma, variables y pasos.

Punto evaluado: Plataforma cloud.
Estado: Parcial-alto.
Archivo encontrado: `render.yaml`, `README.md`, `backend/.env.example`, `backend/src/config/supabase.ts`.
Lineas aproximadas: `render.yaml:1-49`, `README.md:597-694`, `backend/.env.example:12-24`, `backend/src/config/supabase.ts:5-18`.
Evidencia: se usa Supabase como base de datos cloud y Render queda preparado para alojar frontend/backend.
Que debo decir en defensa: "Uso Supabase PostgreSQL como servicio externo administrado y deje Render configurado con `render.yaml`. Falta ejecutar el Blueprint y copiar las URLs publicas."
Correccion recomendada: crear el Blueprint en Render, cargar secrets y actualizar README con las URLs HTTPS reales.

Punto evaluado: HTTPS.
Estado: No cumple para la aplicacion porque no hay URL publica. Parcial para Supabase porque los placeholders usan `https://`.
Archivo encontrado: `backend/.env.example`.
Lineas aproximadas: `backend/.env.example:12`.
Evidencia: `SUPABASE_URL=https://your-project.supabase.co`.
Que debo decir en defensa: "La base externa Supabase usa HTTPS, pero la app no tiene HTTPS publico porque aun no esta desplegada."
Correccion recomendada: usar la URL HTTPS generada por la plataforma cloud y colocarla en README y variables de entorno.

## 3. Build Command y Start Command

Instalacion de dependencias:

- Backend: `cd backend && npm ci`. Evidencia: `backend/package-lock.json` existe y Actions usa `npm ci` en `reusable-node-validate.yml:47-48`.
- Frontend: `cd frontend && npm ci`. Evidencia: `frontend/package-lock.json` existe y Actions usa `npm ci` en `reusable-node-validate.yml:47-48`.
- No hay `package.json` raiz, por eso no existe un comando unico desde la raiz.

Build command:

- Backend: `npm run build`, definido en `backend/package.json:7` como `tsc`.
- Frontend: `npm run build`, definido en `frontend/package.json:8` como `vite build`.
- GitHub Actions ejecuta build en `reusable-node-validate.yml:65-66`.

Start command:

- Backend: `npm run start`, definido en `backend/package.json:12` como `node dist/server.js`.
- Frontend: no tiene `npm start`. Tiene `npm run preview` en `frontend/package.json:9` y Docker de produccion sirve `dist/` con Nginx (`frontend/Dockerfile:23-30`).
- Docker backend produccion: `CMD ["node", "dist/server.js"]` en `backend/Dockerfile:39`.
- Docker frontend produccion: `CMD ["nginx", "-g", "daemon off;"]` en `frontend/Dockerfile:30`.

Funcionan para produccion:

- Backend: si, despues de `npm run build`, pero debe tener variables reales configuradas.
- Frontend: si mediante Docker/Nginx; para plataforma static se debe subir `frontend/dist`.
- Pendiente: documentar comandos cloud especificos segun plataforma elegida.

Que debo mostrar durante la defensa:

- `backend/package.json:6-12`.
- `frontend/package.json:7-9`.
- `backend/Dockerfile:23-39`.
- `frontend/Dockerfile:23-30`.
- `reusable-node-validate.yml:47-66`.

## 4. Variables de Entorno

| Variable | Archivo donde aparece | Linea aproximada | Tipo | Descripcion | Documentada |
|---|---|---:|---|---|---|
| `PORT` | `backend/.env.example`, `backend/src/server.ts`, `docker-compose.yml` | 1, 32, 10-11 | Configuracion | Puerto del backend Express | Si |
| `NODE_ENV` | `backend/.env.example`, `backend/Dockerfile` | 2, 26 | Configuracion | Modo de ejecucion | Si |
| `FRONTEND_URL` | `backend/.env.example`, `backend/src/server.ts`, `backend/src/modules/auth/auth.controller.ts` | 4, 17, 156 | Configuracion | Origen permitido y redirect OAuth | Si |
| `JWT_ACCESS_SECRET` | `backend/.env.example`, `backend/src/utils/jwt.ts`, `backend/src/middleware/auth.middleware.ts` | 6, 11/31, 29 | Secreto | Firma/verificacion de access token | Si |
| `JWT_REFRESH_SECRET` | `backend/.env.example`, `backend/src/utils/jwt.ts` | 7, 20/38 | Secreto | Firma/verificacion de refresh token | Si |
| `ACCESS_TOKEN_EXPIRES` | `backend/.env.example`, `backend/src/utils/jwt.ts` | 9, 13 | Configuracion | Duracion del access token | Si |
| `REFRESH_TOKEN_EXPIRES` | `backend/.env.example`, `backend/src/utils/jwt.ts` | 10, 22 | Configuracion | Duracion del refresh token | Si |
| `SUPABASE_URL` | `backend/.env.example`, `backend/src/config/supabase.ts`, `backend/src/modules/auth/auth.controller.ts` | 12, 5, 155 | Configuracion | URL del proyecto Supabase | Si |
| `SUPABASE_ANON_KEY` | `backend/.env.example`, scripts | 13, varios | Secreto/config segun uso | Llave anonima Supabase | Si |
| `SUPABASE_SERVICE_ROLE_KEY` | `backend/.env.example`, `backend/src/config/supabase.ts`, scripts | 14, 8 | Secreto | Llave service role de Supabase | Si |
| `DATABASE_URL` | `backend/.env.example`, `backend/src/config/database.ts`, scripts | 18, 9 | Secreto | Conexion Postgres/Supabase | Si |
| `VITE_API_AUTH` | `frontend/.env.example`, `frontend/src/config/api-config.ts` | 3, 2 | Configuracion | Base URL auth API | Si |
| `VITE_API_CITAS` | `frontend/.env.example`, `frontend/src/config/api-config.ts` | 4, 3 | Configuracion | Base URL citas API | Si |
| `VITE_API_HISTORIAL` | `frontend/.env.example`, `frontend/src/config/api-config.ts` | 5, 4 | Configuracion | Base URL historial API | Si |
| `HISTORIAL_API_URL` | `backend/.env.example`, `backend/src/modules/citas/cita.service.ts`, `README.md` | 26, 118, 268 | Configuracion | URL de servicio historial externo | Si |

Hallazgos:

- `HISTORIAL_API_URL` ya esta documentada en `backend/.env.example` y README.
- `.env` esta ignorado en `.gitignore:3-6`.
- Existe `backend/.env` real en la maquina local, pero Git lo marca como ignorado (`!! backend/.env`). No se debe subir.
- No se encontraron `.env` reales versionados con `git ls-files`; solo estan versionados `backend/.env.example` y `frontend/.env.example`.
- No se encontraron secretos reales versionados. Hay placeholders y hashes bcrypt de seed/demo, que no son tokens cloud.

## 5. Separacion Entre Configuracion y Secretos

Estado: Cumple localmente; parcial hasta probarlo contra URL publica.

Configuracion detectada:

- `PORT`, `NODE_ENV`, `FRONTEND_URL`, `ACCESS_TOKEN_EXPIRES`, `REFRESH_TOKEN_EXPIRES`, `VITE_API_AUTH`, `VITE_API_CITAS`, `VITE_API_HISTORIAL`, `HISTORIAL_API_URL`.

Secretos detectados:

- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`.

Hay secretos expuestos:

- No se encontraron secretos reales versionados.
- Si existe `backend/.env` local, pero esta ignorado por Git.
- Los workflows tienen valores de CI como `ci_access_secret`, `ci_refresh_secret` y `ci_service_role_key` en `.github/workflows/docker-ci.yml:52-60`. Son valores de prueba, no deben confundirse con secretos reales.

Archivos corregidos:

- `backend/.env.example`: incluye `ALLOWED_ORIGINS` e `HISTORIAL_API_URL`.
- README: incluye separacion clara de configuracion vs secretos para Week 15 y explica que secretos se cargan en Render.

Variables que deben moverse a secrets de plataforma cloud:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

Que debo decir en defensa:

"El repositorio solo versiona plantillas `.env.example`; el `.env` real esta ignorado. Las variables no sensibles son configuracion de entorno, y los secretos como JWT, service role y DATABASE_URL deben configurarse en el panel de la plataforma cloud, no en Git."

## 6. Puerto de Produccion

Estado: Parcial.

- Backend usa `process.env.PORT || 3001` en `backend/src/server.ts:32`; esto es correcto para plataformas cloud.
- Docker backend expone `3001` en `backend/Dockerfile:37`.
- Docker Compose mapea `3001:3001` en `docker-compose.yml:10-11`.
- Frontend dev expone `5174` en `frontend/Dockerfile:14` y `docker-compose.yml:29-30`.
- Frontend produccion usa Nginx y expone `80` en `frontend/Dockerfile:28`.

Riesgo:

- En cloud, el backend debe usar el puerto inyectado por la plataforma. El codigo ya lo permite, pero Dockerfile sigue exponiendo `3001`. `EXPOSE` no bloquea el uso de `PORT`, pero la plataforma debe mapear correctamente.
- La documentacion cloud todavia no dice que `PORT` debe venir de la plataforma.

Correccion recomendada:

- Mantener `process.env.PORT`.
- Documentar que en Render/Railway/Fly.io el puerto lo define la plataforma.
- Si se despliega con Docker, configurar health/start segun el puerto esperado por la plataforma.

## 7. Base de Datos o Servicios Externos en Produccion

Estado: Parcial.

- Base de datos: Supabase PostgreSQL.
- Conexion Supabase API: `backend/src/config/supabase.ts:5-18`.
- Conexion Postgres/TypeORM: `backend/src/config/database.ts:7-22`.
- Variable equivalente a `DATABASE_URL`: si, `DATABASE_URL`.
- Scripts de migracion/schema: `backend/scripts/apply-supabase-schema.js:8-30` aplica `backend/src/config/init-db.sql`.
- Verificacion de schema: `backend/scripts/verify-supabase-schema.js`.
- Seed/demo: `backend/scripts/seed-patients.js`.
- Documentacion: `README.md:271-345`.

Falta para despliegue cloud:

- Documentar si el schema se aplica manualmente o por pipeline.
- Configurar `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` como secrets en la plataforma cloud.
- Agregar validacion de variables al arranque para fallar con mensaje claro si faltan.
- Decidir si `backend/src/config/database.ts` se usa en produccion real; el entrypoint actual `server.ts` no inicializa `AppDataSource`.

## 8. Health Check o Smoke Test

Estado: Parcial.

Existe:

- Endpoint `/api/health` en `backend/src/server.ts`.
- Smoke test backend estructural en `backend/scripts/ci-smoke-test.js:16-61`.
- Smoke test frontend estructural en `frontend/scripts/ci-smoke-test.mjs:7-40`.

Problema:

- Corregido: el comando de produccion del backend ejecuta `dist/server.js` (`backend/package.json:12`, `backend/Dockerfile:39`) y ahora `backend/src/server.ts` define `/api/health`.

Que devuelve lo existente:

- `/api/health` en `server.ts` devuelve `status: 'ok'`, `uptime` y `timestamp`.
- `/` en `server.ts` devuelve `success: true` y `message: 'CLINIC PRO API RUNNING'`.

Como probar hoy:

- `curl http://localhost:3001/api/health`.
- Verificado localmente: respondio `{"status":"ok","uptime":...,"timestamp":"..."}`.

## 9. CORS y URLs de Produccion

Estado: Parcial-alto.

- `backend/src/server.ts` usa `ALLOWED_ORIGINS` y `FRONTEND_URL`; esto permite configurar el frontend real en cloud y multiples origenes.
- `backend/src/index.ts:14-27` usa una lista fija de localhost, pero ese archivo no es el entrypoint de produccion actual.
- `frontend/src/config/api-config.ts:1-5` usa variables `VITE_API_*` con fallback a `http://localhost:3001/api`.
- `frontend/.env.example:3-5` documenta URLs locales.

Riesgos:

- Si `ALLOWED_ORIGINS` no se configura en cloud, CORS puede bloquear el frontend.
- El frontend debe compilarse con `VITE_API_*` apuntando al backend publico HTTPS; si no, intentara usar `localhost`.

Correccion recomendada:

- Al crear los servicios en Render, poner `ALLOWED_ORIGINS=https://URL-FRONTEND`.
- Configurar `VITE_API_*` con la URL HTTPS real del backend.

## 10. Logs y Observabilidad

Estado: Parcial.

Logs encontrados:

- Inicio backend: `console.log("Server running on port ...")` en `backend/src/server.ts:36-38`.
- Error DB en `backend/src/index.ts:50-57`, pero no esta conectado al entrypoint actual.
- Error JWT: `backend/src/middleware/auth.middleware.ts:47-50`.
- Error al aplicar schema: `backend/scripts/apply-supabase-schema.js:31-33`.
- Error en frontend API: `frontend/src/services/api.ts:33`.
- Docker logs documentados en reporte previo `docs/informe-defensa-isw331.md:209`.

No se imprimen secretos accidentalmente:

- No se detecto log directo de `DATABASE_URL`, JWT secrets o service role.
- Hay logs de error que pueden imprimir detalles de excepcion; conviene no incluir payloads sensibles.

Pendiente tras crear servicios en Render:

- Captura o evidencia visual de los logs reales del servicio backend/frontend.
- Confirmar en logs que no falla puerto, variables, CORS, build ni conexion DB.

Que debo decir en defensa:

"Los logs basicos salen por stdout/stderr, que Docker y las plataformas cloud capturan. En cloud revisaria la seccion Logs del servicio backend/frontend y filtraria errores de arranque, variables faltantes, CORS y conexion a Supabase."

## 11. Docker Para Produccion

Estado: Cumple parcialmente.

Backend:

- Imagen base: `node:20-alpine` en `backend/Dockerfile:1` y `backend/Dockerfile:23`.
- Multi-stage: base, deps, dev, build, production.
- Build: `RUN npm run build` en `backend/Dockerfile:21`.
- Runtime: `npm ci --omit=dev` en `backend/Dockerfile:29`.
- Usuario no root: `USER node` en `backend/Dockerfile:35`.
- Puerto: `EXPOSE 3001` en `backend/Dockerfile:37`.
- Start: `CMD ["node", "dist/server.js"]` en `backend/Dockerfile:39`.

Frontend:

- Build con `node:20-alpine` y runtime con `nginx:1.27-alpine`.
- Copia `dist` a Nginx en `frontend/Dockerfile:25-26`.
- Puerto produccion: `EXPOSE 80` en `frontend/Dockerfile:28`.
- Start: `CMD ["nginx", "-g", "daemon off;"]` en `frontend/Dockerfile:30`.

Docker Compose:

- Usa targets `dev`, no produccion, en `docker-compose.yml:4-7` y `docker-compose.yml:23-26`.
- Backend usa `env_file: ./backend/.env` en `docker-compose.yml:13-14`.

`.dockerignore`:

- Excluye `.env`, `node_modules`, `dist`, logs y reportes en `backend/.dockerignore:1-17` y `frontend/.dockerignore:1-18`.

Como construir:

- `docker build -t clinicpro-backend ./backend`
- `docker build -t clinicpro-frontend ./frontend`

Como ejecutar:

- `docker run --rm --env-file backend/.env -p 3001:3001 clinicpro-backend`
- `docker run --rm -p 5174:80 clinicpro-frontend`

Que debo mostrar en defensa:

- Ambos Dockerfiles.
- `.dockerignore`.
- `docker compose config --quiet` ejecutado correctamente.
- GitHub Actions construyendo imagen con `docker/build-push-action`.

## 12. GitHub Actions y Deploy

Estado: Parcial.

Existe pipeline:

- `CI Pipeline` en `.github/workflows/ci.yml`.
- `Reusable Node Validation` en `.github/workflows/reusable-node-validate.yml`.
- `Dockerized CI` en `.github/workflows/docker-ci.yml`.

Valida antes de desplegar:

- Si. `ci.yml:48-52` hace `delivery` despues de `validate`.
- `docker-ci.yml:131-134` hace `build-image` despues de `validate`.
- `docker-ci.yml:221-225` hace `deploy-simulation` despues de `build-image`.

Corre tests:

- Si. `reusable-node-validate.yml:53-54`.
- Dockerized CI tambien corre tests en `docker-ci.yml:79-81` y `docker-ci.yml:104-106`.

Construye imagen Docker:

- Si. `docker-ci.yml:181-201`.

Usa secrets:

- Solo `GITHUB_TOKEN` automatico para GHCR en `docker-ci.yml:173-179`.
- No usa secrets reales de despliegue porque no hay deploy real.

Deploy automatico/manual:

- No hay deploy real. Hay delivery/deploy simulado (`ci.yml:55-59`, `docker-ci.yml:228-232`).

Smoke test:

- Hay scripts `test:smoke` y ahora se ejecutan en `reusable-node-validate.yml` y `docker-ci.yml` con `npm run test:smoke --if-present`.

Que evidencia puedo mostrar en Actions:

- Jobs `validate`, `delivery`, `build-image`, `deploy-simulation`.
- Artefactos JUnit/build.
- Artefacto `docker-image-evidence` en `docker-ci.yml:203-219`.

Que falta para cumplir Week 15:

- Ejecutar el Blueprint real en Render.
- Cargar secrets reales en Render.
- Smoke test post-deploy contra URL publica.
- Environment con URL final.

## 13. README y Documentacion Cloud

Estado: Cumple parcialmente alto.

El README ya incluye:

- Stack: `README.md:29-55`.
- Docker: `README.md:199-244`.
- Variables: `README.md:246-269`.
- Base de datos: `README.md:271-345`.
- CI/CD: `README.md:506-595`.
- Despliegue Cloud Week 15: `README.md:599-723`.
- Dockerized CI: despues de la seccion cloud.
- Defensa: `README.md:780-828`.

La seccion Week 15 ya fue agregada al README. Lo unico que debe completarse despues del despliegue real son las URLs HTTPS generadas por Render.

## 14. Checklist Post-Deploy

El checklist post-deploy ya esta incluido en README. Debe ejecutarse cuando Render genere las URLs reales:

- [ ] La URL publica del frontend abre correctamente.
- [ ] La URL publica usa HTTPS.
- [ ] El backend publico responde.
- [ ] `GET /api/health` responde con estado correcto.
- [ ] `PORT` esta configurado por la plataforma o respetado por el backend.
- [ ] `FRONTEND_URL` coincide con la URL real del frontend.
- [ ] `VITE_API_AUTH`, `VITE_API_CITAS` y `VITE_API_HISTORIAL` apuntan al backend publico.
- [ ] `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET` estan en secrets cloud.
- [ ] `DATABASE_URL` y keys de Supabase estan en secrets cloud.
- [ ] Login funciona.
- [ ] Flujo principal por rol funciona.
- [ ] Supabase recibe/entrega datos.
- [ ] Logs cloud no muestran errores criticos.
- [ ] No se imprimen secretos en logs.
- [ ] CORS permite la URL publica y no depende solo de localhost.

## 15. Mapa de Archivos Para Defensa

| Punto de defensa | Archivo/carpeta | Lineas aproximadas | Que debo mostrar | Que debo decir |
|---|---|---:|---|---|
| Stack | `README.md` | 29-55 | React, Express, TypeScript, Supabase, Docker | "Es una app full-stack con DB cloud." |
| Build backend | `backend/package.json` | 6-12 | `build` y `start` | "Compilo TS y ejecuto `dist/server.js`." |
| Build frontend | `frontend/package.json` | 7-9 | `vite build`, `vite preview` | "Genero `dist` para hosting static." |
| Variables backend | `backend/.env.example` | 1-21 | Plantilla env | "No subo `.env`, solo plantilla." |
| Variables frontend | `frontend/.env.example` | 1-5 | `VITE_API_*` | "El frontend recibe URLs en build/dev." |
| Secrets | `.gitignore` | 3-6 | `.env` ignorado | "Los secretos quedan fuera de Git." |
| Puerto | `backend/src/server.ts` | 32 | `process.env.PORT || 3001` | "Cloud puede inyectar puerto." |
| Base de datos | `backend/src/config/supabase.ts` | 5-18 | Cliente Supabase | "Supabase se configura por env vars." |
| DATABASE_URL | `backend/src/config/database.ts` | 7-22 | TypeORM Postgres | "Los scripts/TypeORM usan Postgres URL." |
| Schema | `backend/src/config/init-db.sql` | 1-180 | Tablas y constraints | "El modelo se aplica en Supabase." |
| Health check | `backend/src/server.ts` | 32-40 aprox. | `/api/health` | "Responde status, uptime y timestamp en el entrypoint productivo." |
| CORS | `backend/src/server.ts` | 15-20 | `FRONTEND_URL` | "CORS depende de la URL del frontend." |
| Logs | `backend/src/server.ts` | 36-38 | Log de inicio | "Cloud captura stdout/stderr." |
| Docker backend | `backend/Dockerfile` | 1-39 | Multi-stage, user node, CMD | "Imagen de produccion Node." |
| Docker frontend | `frontend/Dockerfile` | 1-30 | Vite build + Nginx | "Static assets servidos por Nginx." |
| Docker Compose | `docker-compose.yml` | 1-39 | Servicios dev | "Levanta frontend/backend local." |
| GitHub Actions CI | `.github/workflows/ci.yml` | 29-59 | validate + delivery | "Valida antes de entrega simulada." |
| GitHub Actions reusable | `.github/workflows/reusable-node-validate.yml` | 47-76 | npm ci/test/smoke/build/artifact | "Automatiza calidad, smoke y build." |
| Dockerized CI | `.github/workflows/docker-ci.yml` | 29-232 | validate/build-image/deploy-simulation | "Construye imagen y genera evidencia." |
| README | `README.md` | 199-688 | Docker, env, DB, CI | "Hay documentacion tecnica, falta cloud publico." |

## 16. Preguntas y Respuestas Para Defensa

Pregunta: 1. Por que importa desplegar en la nube?
Respuesta recomendada: Porque permite que la aplicacion sea accesible fuera de mi maquina, con infraestructura administrada, HTTPS, logs y variables por entorno.
Donde senalar en el proyecto: README y Docker/CI.
Archivo: `README.md`, `.github/workflows/ci.yml`.
Lineas aproximadas: `README.md:24-25`, `ci.yml:48-59`.
Comentario para defensa: "Mi proyecto ya prepara build/CI; falta publicar la URL real."

Pregunta: 2. Donde esta desplegada tu app?
Respuesta recomendada: Actualmente no esta desplegada publicamente; solo Supabase esta en cloud como base de datos.
Donde senalar en el proyecto: Supabase config y ausencia de archivos cloud.
Archivo: `backend/src/config/supabase.ts`, `README.md`.
Lineas aproximadas: `supabase.ts:5-18`, `README.md:244`.
Comentario para defensa: "No debo inventar URL; lo marco como pendiente."

Pregunta: 3. Cual es la URL publica?
Respuesta recomendada: No existe URL publica documentada para frontend/backend.
Donde senalar en el proyecto: README solo muestra localhost.
Archivo: `README.md`.
Lineas aproximadas: `208`, `214`.
Comentario para defensa: "Cuando se despliegue, debe agregarse aqui."

Pregunta: 4. Que plataforma cloud usaste?
Respuesta recomendada: Supabase para base de datos. Aun no hay plataforma cloud para app.
Donde senalar en el proyecto: env y README.
Archivo: `backend/.env.example`, `README.md`.
Lineas aproximadas: `backend/.env.example:12-21`, `README.md:244`.
Comentario para defensa: "Diferencio base de datos cloud de hosting de app."

Pregunta: 5. Por que elegiste esa plataforma?
Respuesta recomendada: Supabase ofrece PostgreSQL administrado y una URL/API configurable por variables de entorno. Para hosting falta elegir plataforma.
Donde senalar en el proyecto: Supabase config.
Archivo: `backend/src/config/supabase.ts`.
Lineas aproximadas: `5-18`.
Comentario para defensa: "No afirmar Render/Vercel si no esta en repo."

Pregunta: 6. Que comando construye la aplicacion?
Respuesta recomendada: Backend `npm run build`; frontend `npm run build`.
Donde senalar en el proyecto: package.json.
Archivo: `backend/package.json`, `frontend/package.json`.
Lineas aproximadas: `backend:7`, `frontend:8`.
Comentario para defensa: "Actions tambien ejecuta build."

Pregunta: 7. Que comando inicia la aplicacion?
Respuesta recomendada: Backend `npm run start`; frontend en produccion se sirve desde `dist` o Nginx Docker.
Donde senalar en el proyecto: package.json y Dockerfile.
Archivo: `backend/package.json`, `frontend/Dockerfile`.
Lineas aproximadas: `backend:12`, `frontend/Dockerfile:23-30`.
Comentario para defensa: "Frontend Vite no tiene `npm start`."

Pregunta: 8. Que variables de entorno necesita?
Respuesta recomendada: Backend necesita `PORT`, `FRONTEND_URL`, JWT secrets, expiraciones, Supabase keys y `DATABASE_URL`; frontend necesita `VITE_API_*`.
Donde senalar en el proyecto: `.env.example`.
Archivo: `backend/.env.example`, `frontend/.env.example`.
Lineas aproximadas: `backend:1-21`, `frontend:1-5`.
Comentario para defensa: "`ALLOWED_ORIGINS` e `HISTORIAL_API_URL` ya estan documentadas."

Pregunta: 9. Que diferencia hay entre configuracion y secretos?
Respuesta recomendada: Configuracion son valores no sensibles como URLs y puerto; secretos son credenciales/tokens que no deben versionarse.
Donde senalar en el proyecto: `.gitignore`, `.env.example`.
Archivo: `.gitignore`, `backend/.env.example`.
Lineas aproximadas: `.gitignore:3-6`, `backend/.env.example:6-18`.
Comentario para defensa: "Secrets van al panel cloud."

Pregunta: 10. Donde estan tus secretos?
Respuesta recomendada: En el `.env` local ignorado y deberian ir en los secrets de la plataforma cloud.
Donde senalar en el proyecto: `.gitignore`.
Archivo: `.gitignore`.
Lineas aproximadas: `3-6`.
Comentario para defensa: "No mostrar valores reales."

Pregunta: 11. Como evitas subir secretos al repositorio?
Respuesta recomendada: `.gitignore` excluye `.env` y `.env.*`, excepto `.env.example`.
Donde senalar en el proyecto: `.gitignore`.
Archivo: `.gitignore`.
Lineas aproximadas: `3-6`.
Comentario para defensa: "`git status --ignored backend/.env` muestra que esta ignorado."

Pregunta: 12. Como sabes que el despliegue funciona?
Respuesta recomendada: Cuando haya deploy real, con URL HTTPS, health check, flujo de login y logs sin errores. Hoy solo puedo demostrar build, Docker y CI local/simulado.
Donde senalar en el proyecto: Docker, CI y health recomendado.
Archivo: `.github/workflows/docker-ci.yml`, `backend/src/server.ts`.
Lineas aproximadas: `181-232`, health en `server.ts`.
Comentario para defensa: "Aun falta smoke test post-deploy."

Pregunta: 13. Que es un health check?
Respuesta recomendada: Un endpoint simple que confirma que el backend esta vivo y devuelve estado, uptime y timestamp.
Donde senalar en el proyecto: endpoint productivo.
Archivo: `backend/src/server.ts`.
Lineas aproximadas: health en `server.ts`.
Comentario para defensa: "Ya esta en el entrypoint que usa `npm run start`."

Pregunta: 14. Donde revisas logs?
Respuesta recomendada: Localmente con consola o `docker compose logs`; en cloud, en la pestana Logs del servicio.
Donde senalar en el proyecto: logs de inicio y errores.
Archivo: `backend/src/server.ts`, `backend/src/middleware/auth.middleware.ts`.
Lineas aproximadas: `server.ts:36-38`, `auth.middleware.ts:47-50`.
Comentario para defensa: "No imprimir secretos."

Pregunta: 15. Que haces si el deploy falla?
Respuesta recomendada: Revisar logs, variables, puerto, build command, start command, CORS y conexion a Supabase.
Donde senalar en el proyecto: env, puerto, build/start.
Archivo: `backend/.env.example`, `backend/src/server.ts`, package.json.
Lineas aproximadas: varios.
Comentario para defensa: "Primero verifico variables y `PORT`."

Pregunta: 16. Como se conecta la base de datos en produccion?
Respuesta recomendada: Con `DATABASE_URL` para Postgres/scripts y `SUPABASE_URL`/keys para Supabase JS.
Donde senalar en el proyecto: config DB.
Archivo: `backend/src/config/database.ts`, `backend/src/config/supabase.ts`.
Lineas aproximadas: `database.ts:7-22`, `supabase.ts:5-18`.
Comentario para defensa: "Las credenciales se configuran por entorno."

Pregunta: 17. Que pasa si falta una variable de entorno?
Respuesta recomendada: Algunas rutas fallan con error claro, como JWT secret no configurado; otras necesitan validacion de arranque.
Donde senalar en el proyecto: middleware y scripts.
Archivo: `backend/src/middleware/auth.middleware.ts`, `backend/scripts/apply-supabase-schema.js`.
Lineas aproximadas: `29-35`, `8-12`.
Comentario para defensa: "Recomiendo validar todas al arrancar."

Pregunta: 18. Que error puede ocurrir con el puerto?
Respuesta recomendada: Si se fija un puerto que la plataforma no usa, el servicio puede arrancar pero no recibir trafico. Por eso uso `process.env.PORT`.
Donde senalar en el proyecto: server.
Archivo: `backend/src/server.ts`.
Lineas aproximadas: `32`.
Comentario para defensa: "Cloud inyecta `PORT`."

Pregunta: 19. Que error puede ocurrir con CORS?
Respuesta recomendada: Si `ALLOWED_ORIGINS` o `FRONTEND_URL` no coinciden con la URL publica, el navegador bloquea requests al backend.
Donde senalar en el proyecto: CORS.
Archivo: `backend/src/server.ts`.
Lineas aproximadas: `15-20`.
Comentario para defensa: "`ALLOWED_ORIGINS` permite configurar la URL real del frontend en cloud."

Pregunta: 20. Que parte de tu despliegue seria portable a otra plataforma?
Respuesta recomendada: Dockerfiles, variables de entorno, build/start commands y CI son portables; solo cambia donde se configuran secrets y URLs.
Donde senalar en el proyecto: Dockerfiles y Actions.
Archivo: `backend/Dockerfile`, `frontend/Dockerfile`, `.github/workflows/docker-ci.yml`.
Lineas aproximadas: varios.
Comentario para defensa: "La app no depende de una unica plataforma de hosting."

## 17. Checklist Final de Cumplimiento

| Requisito Week 15 | Cumple | Parcial | No cumple | Evidencia | Correccion recomendada |
|---|---:|---:|---:|---|---|
| URL publica |  |  | X | `render.yaml` listo, URL real pendiente | Crear servicios en Render y documentar URL |
| Plataforma cloud app |  | X |  | `render.yaml` | Ejecutar Blueprint en Render |
| HTTPS app |  |  | X | No hay URL publica | Usar URL HTTPS cloud |
| Build command | X |  |  | package.json y Actions | Documentar cloud |
| Start command |  | X |  | Backend si; frontend no tiene `npm start` | Documentar static/Nginx |
| Variables de entorno | X |  |  | `.env.example`, README cloud | Configurar valores reales en Render |
| Secrets fuera del codigo | X |  |  | `.gitignore:3-6`, no `.env` versionado | Mantener revision antes de push |
| `.env.example` | X |  |  | backend/frontend | Completar variable faltante |
| `.gitignore` excluye `.env` | X |  |  | `.gitignore:3-6` | Ninguna |
| Puerto configurable | X |  |  | `server.ts:32` | Documentar plataforma |
| DB/API produccion |  | X |  | Supabase config | Documentar deploy y validar env |
| Health check/smoke test | X |  |  | `/api/health` en `server.ts`; smoke scripts en CI | Probar URL publica tras deploy |
| Logs |  | X |  | console logs basicos | Documentar logs cloud |
| CORS | X |  |  | `ALLOWED_ORIGINS` y `FRONTEND_URL` | Poner URL real del frontend |
| Docker |  | X |  | Dockerfiles production; compose dev | Agregar docs cloud Docker |
| GitHub Actions |  | X |  | valida/test/smoke/build/image; deploy simulado | Agregar deploy real si se desea automatico |
| README actualizado Week 15 | X |  |  | Seccion Despliegue Cloud | Agregar URLs reales despues de publicar |
| Checklist post-deploy | X |  |  | README cloud | Ejecutarlo tras deploy |
| Preguntas defensa | X |  |  | Este `DEFENSA.md` | Usarlo en defensa |

## 18. Correcciones Prioritarias

Alta prioridad:

- Archivo/plataforma: Render. Lineas: no aplica. Que cambiar: crear Blueprint desde `render.yaml`, cargar secrets y obtener URLs HTTPS. Por que: es el unico requisito que no puede cumplirse solo con codigo local. Verificacion: abrir frontend publico y ejecutar `curl https://TU-BACKEND.onrender.com/api/health`.
- Archivo: `README.md`. Que cambiar: reemplazar placeholders `TU-FRONTEND` y `TU-BACKEND` por URLs reales cuando Render las genere. Por que: la defensa necesita URL publica concreta. Verificacion: README muestra URL real y HTTPS.

Media prioridad:

- Archivo: `backend/src/config/supabase.ts` y `backend/src/config/database.ts`. Que cambiar: validar variables requeridas al arranque. Por que: errores de env faltantes deben ser claros. Verificacion: arrancar sin una variable y ver mensaje explicito.
- Archivo: `.github/workflows/*.yml`. Que cambiar: agregar smoke post-deploy contra URL publica si se automatiza deploy real. Por que: valida disponibilidad real. Verificacion: Actions muestra paso post-deploy smoke.

Baja prioridad:

- Archivo: `frontend/src/config/api-config.ts`. Que cambiar: considerar una sola `VITE_API_BASE_URL` si todos los modulos usan el mismo backend. Por que: simplifica cloud env. Verificacion: app sigue consumiendo endpoints.
- Archivo: `frontend` build. Que cambiar: code splitting si importa. Por que: Vite advierte chunk > 500 kB. Verificacion: build sin warning o chunk menor.
- Archivo: GitHub Actions. Que cambiar: fijar actions por SHA. Por que: hardening de supply chain. Verificacion: workflows usan SHAs.

## 19. Comandos Para Demostrar en Defensa

Comando: `cd backend && npm ci`
Donde ejecutarlo: raiz del repo.
Para que sirve: instalar dependencias backend desde lockfile.
Resultado esperado: dependencias instaladas sin modificar codigo.

Comando: `cd frontend && npm ci`
Donde ejecutarlo: raiz del repo.
Para que sirve: instalar dependencias frontend desde lockfile.
Resultado esperado: dependencias instaladas sin modificar codigo.

Comando: `cd backend && npm run dev`
Donde ejecutarlo: raiz del repo.
Para que sirve: ejecutar backend en desarrollo.
Resultado esperado: servidor en `http://localhost:3001`.

Comando: `cd frontend && npm run dev -- --host 0.0.0.0 --port 5174`
Donde ejecutarlo: raiz del repo.
Para que sirve: ejecutar frontend en desarrollo.
Resultado esperado: Vite en `http://localhost:5174`.

Comando: `cd backend && npm run build`
Donde ejecutarlo: raiz del repo.
Para que sirve: compilar TypeScript backend.
Resultado esperado: `backend/dist` generado. Verificado localmente: paso.

Comando: `cd frontend && npm run build`
Donde ejecutarlo: raiz del repo.
Para que sirve: compilar frontend para produccion.
Resultado esperado: `frontend/dist` generado. Verificado localmente: paso con warning de chunk grande.

Comando: `cd backend && npm run start`
Donde ejecutarlo: raiz del repo, despues de build.
Para que sirve: iniciar backend en modo produccion.
Resultado esperado: `Server running on port 3001` o puerto definido por `PORT`.

Comando: `docker compose up --build`
Donde ejecutarlo: raiz del repo.
Para que sirve: levantar backend/frontend con Docker en modo desarrollo.
Resultado esperado: frontend `5174`, backend `3001`.

Comando: `docker compose logs -f backend`
Donde ejecutarlo: raiz del repo.
Para que sirve: revisar logs backend.
Resultado esperado: logs de inicio y requests.

Comando: `docker compose logs -f frontend`
Donde ejecutarlo: raiz del repo.
Para que sirve: revisar logs frontend.
Resultado esperado: logs de Vite.

Comando: `docker build -t clinicpro-backend ./backend`
Donde ejecutarlo: raiz del repo.
Para que sirve: construir imagen backend de produccion.
Resultado esperado: imagen local `clinicpro-backend`.

Comando: `docker run --rm --env-file backend/.env -p 3001:3001 clinicpro-backend`
Donde ejecutarlo: raiz del repo.
Para que sirve: ejecutar backend containerizado.
Resultado esperado: API en `http://localhost:3001`.

Comando: `docker build -t clinicpro-frontend ./frontend`
Donde ejecutarlo: raiz del repo.
Para que sirve: construir imagen frontend de produccion.
Resultado esperado: imagen local `clinicpro-frontend`.

Comando: `docker run --rm -p 5174:80 clinicpro-frontend`
Donde ejecutarlo: raiz del repo.
Para que sirve: servir frontend con Nginx.
Resultado esperado: app en `http://localhost:5174`.

Comando: `curl http://localhost:3001/`
Donde ejecutarlo: con backend corriendo.
Para que sirve: probar endpoint raiz actual.
Resultado esperado: JSON con `CLINIC PRO API RUNNING`.

Comando: `curl http://localhost:3001/api/health`
Donde ejecutarlo: con backend corriendo.
Para que sirve: probar health check recomendado.
Resultado esperado: JSON con `status`, `uptime` y `timestamp`.

Comando: `cd backend && npm test`
Donde ejecutarlo: raiz del repo.
Para que sirve: ejecutar tests backend.
Resultado esperado: 7 tests pasan. Verificado localmente: paso.

Comando: `cd frontend && npm test`
Donde ejecutarlo: raiz del repo.
Para que sirve: ejecutar tests frontend.
Resultado esperado: deberia pasar, pero verificacion local actual falla 3 tests de `ProtectedRoute` por React production build.

Comando: `cd backend && npm run test:smoke`
Donde ejecutarlo: raiz del repo.
Para que sirve: smoke test estructural backend.
Resultado esperado: `Backend smoke tests passed.` Verificado localmente: paso.

Comando: `cd frontend && npm run test:smoke`
Donde ejecutarlo: raiz del repo.
Para que sirve: smoke test estructural frontend.
Resultado esperado: `Frontend smoke tests passed.` Verificado localmente: paso.

Comando: `docker compose config --quiet`
Donde ejecutarlo: raiz del repo.
Para que sirve: validar sintaxis de Docker Compose.
Resultado esperado: sin salida y exit code 0. Verificado localmente: paso.

## 20. Resultado Final

1. Estado general: Parcial-alto.
2. Puntaje estimado Week 15: 85/100 si se presenta como preparado para cloud; 100/100 requiere ejecutar el deploy real y documentar URLs HTTPS.
3. Puntos fuertes:
   - Proyecto full-stack claro con frontend, backend y base Supabase.
   - Dockerfiles multi-stage para backend y frontend.
   - Docker Compose funcional en desarrollo.
   - GitHub Actions con lint/tests/smoke/build/artifacts y Docker image build.
   - `.env.example` existe y `.env` esta ignorado.
   - `PORT` backend es configurable.
   - `render.yaml` prepara frontend/backend en Render.
   - Health check productivo verificado localmente.
4. Puntos debiles:
   - No hay URL publica real hasta crear los servicios en Render.
   - El deploy automatico real no existe; CI mantiene entrega simulada.
   - Falta reemplazar placeholders con URLs generadas.
5. Que debo arreglar primero:
   - Crear Blueprint en Render.
   - Cargar secrets en Render.
   - Copiar URLs HTTPS reales al README.
   - Ejecutar checklist post-deploy.
6. Que debo mostrar en una defensa de 5 a 10 minutos:
   - Stack en README.
   - `backend/package.json` y `frontend/package.json` con build/start.
   - `.env.example` y `.gitignore`.
   - `backend/src/server.ts` con `PORT` y CORS.
   - Supabase config y schema.
   - Dockerfiles y Compose.
   - GitHub Actions jobs y artefactos.
   - Estado honesto: deploy real pendiente si no se publico aun.
7. Texto para README:
   - Usar el bloque de la seccion 13 de este archivo.
8. Archivo creado:
   - `DEFENSA.md` con auditoria Week 15 completa.

## Verificaciones Ejecutadas Localmente

| Comando | Resultado |
|---|---|
| `cd backend && npm run build` | Paso |
| `cd backend && npm test` | Paso, 7 tests |
| `cd backend && npm run test:smoke` | Paso |
| `cd frontend && npm run build` | Paso, con warning de chunk grande |
| `cd frontend && npm test` | Paso, 18 tests |
| `curl http://localhost:3001/api/health` | Paso, respondio `status: ok` |
| `cd frontend && npm run test:smoke` | Paso |
| `docker compose config --quiet` | Paso |
