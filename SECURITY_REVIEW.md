# DEFENSA Week 18 - Web Security

Revision y mejoras aplicadas sobre ClinicPRO el 2026-06-07.

Frase clave para defensa: La revision reduce riesgos comunes, pero no garantiza seguridad absoluta.

## 1. Resumen Week 18

ClinicPRO es una aplicacion React + Express + TypeScript con Supabase PostgreSQL. La revision de Week 18 identifica assets, actores, entry points, trust boundaries, riesgos OWASP y controles existentes. Tambien agrega fixes concretos y defendibles sin inventar credenciales ni eliminar funcionalidad.

Fixes aplicados:

1. Security headers HTTP en el backend.
2. Rate limiting en endpoints publicos de autenticacion.
3. Validacion central de parametros `:id` como UUID antes de consultar base de datos.
4. CORS mas explicito con metodos, headers permitidos y `x-request-id` expuesto.
5. Scripts y pasos de `npm audit` para higiene de dependencias.
6. Actualizacion de lockfiles con `npm audit fix`; backend y frontend quedaron con `found 0 vulnerabilities`.

## 2. Objetivo

Demostrar una revision basica pero real de seguridad web:

- Identificar riesgos reales del proyecto.
- Aplicar controles concretos.
- Documentar evidencia verificable.
- Marcar pendientes sin decir que la app es completamente segura.

## 3. Revision Inicial

| Area | Estado | Evidencia | Riesgo encontrado | Accion recomendada |
|---|---|---|---|---|
| Tecnologia principal | React, Express, TypeScript, Supabase PostgreSQL | `README.md`, `backend/package.json`, `frontend/package.json` | Stack web expuesto a riesgos OWASP comunes | Mantener validacion, auth, headers y auditorias |
| Frontend | React/Vite con rutas protegidas | `frontend/src/app/layouts/ProtectedRoute.tsx` | Tokens en `localStorage` son accesibles si ocurre XSS | Mantener XSS bajo control; evaluar cookies HttpOnly a futuro |
| Backend | Express API | `backend/src/server.ts` | Necesita headers y rate limiting | Fix aplicado en `security.middleware.ts` |
| Base de datos | Supabase PostgreSQL | `backend/src/config/supabase.ts`, `data.routes.ts` | Riesgo de acceso por IDs si falta autorizacion | Reforzar ownership y roles por endpoint |
| Autenticacion | JWT + refresh token | `auth.service.ts`, `jwt.ts` | Login/register pueden ser atacados por fuerza bruta | Rate limiting aplicado |
| Autorizacion | Middleware de roles | `role.middleware.ts`, `data.routes.ts` | Algunas rutas por ID deben validar permisos por rol/ownership | Documentado; varios checks ya existen |
| Rutas publicas | `/`, `/api/health`, `/api/metrics`, `/api/auth/*` | `server.ts`, `auth.routes.ts` | Auth publica requiere limites | Rate limiting aplicado |
| Rutas protegidas | `/api/*` despues de auth middleware | `server.ts` | CORS no reemplaza auth | Mantener JWT y roles backend |
| Formularios | Login, registro, pacientes, citas, medicos | Frontend pages + schemas backend | Validacion solo frontend no basta | Backend valida con Zod/manual |
| Endpoints API | REST JSON | `data.routes.ts`, `auth.routes.ts` | IDs invalidos pueden llegar a DB | UUID param middleware aplicado |
| Tokens | Authorization Bearer + refresh en body | `api-client.ts`, `auth-storage.ts` | `localStorage` es sensible a XSS | Pendiente migrar a cookies HttpOnly si aplica |
| Cookies | No se usan para auth; sidebar usa cookie UI | `sidebar.tsx`, `server.ts` | CSRF menor para auth Bearer; cookies UI no autorizan APIs | Mantener CORS y Authorization |
| CORS | Allowlist por env | `server.ts` | Config incompleta puede abrir origenes | CORS explicitado |
| DB queries | Supabase query builder | `data.routes.ts`, `auth.service.ts` | Inyeccion si se concatenan queries | No se observo SQL concatenado; mantener whitelists |
| Uploads | No se observaron endpoints de upload | busqueda repo | No aplica por ahora | Revisar si se agrega upload |
| Variables entorno | `.env.example` sin secretos reales | `.gitignore`, `backend/.env.example` | Secretos reales no deben subirse | Mantener `.env` ignorado |
| Docker | Usa `env_file` local | `docker-compose.yml` | `.env` local no debe versionarse | `.gitignore` lo cubre |
| GitHub Actions | Permisos minimos y lockfiles | `.github/workflows/*` | Faltaba audit de dependencias | Audit step aplicado |
| Logs seguridad | Auth failure, authorization failure, rate limit | `auth.middleware.ts`, `role.middleware.ts`, `security.middleware.ts` | No registrar tokens ni passwords | Logger redacta campos sensibles |

## 4. Assets

| Asset | Riesgo | Control que lo reduce | Evidencia | Lineas aprox. |
|---|---|---|---|---:|
| Usuarios | Acceso no autorizado | JWT + roles backend | `auth.middleware.ts`, `role.middleware.ts` | 20-85, 10-45 |
| Passwords/hashes | Robo o texto plano | bcrypt y `password_hash` | `auth.service.ts` | 120-165 |
| Tokens | Robo/reuso | Expiracion y refresh token hash | `jwt.ts`, `auth.service.ts` | 10-40, 24-70 |
| Datos personales | Exposicion por rutas o logs | Roles, whitelists, logger redaction | `data.routes.ts`, `logger.ts` | varios, 16-39 |
| Registros del sistema | Manipulacion | `/logs` solo admin | `data.routes.ts` | 1596 |
| Datos administrativos | Escalada de privilegios | `authorizeRoles('admin')` | `data.routes.ts` | 796, 882, 908 |
| Claves API | Filtracion | `.env` ignorado y `.env.example` placeholder | `.gitignore`, `backend/.env.example` | 4-8, 1-24 |
| Configuracion deploy | Mala configuracion | README/render env docs | `README.md`, `render.yaml` | deploy section |
| Base de datos | Injection o acceso indebido | Supabase query builder + whitelists | `data.routes.ts` | 8-18, 545-787 |

## 5. Actors

| Actor | Riesgo | Control | Evidencia | Lineas aprox. |
|---|---|---|---|---:|
| Visitante anonimo | Fuerza bruta login/registro | Rate limiting auth | `auth.routes.ts` | 19-36 |
| Usuario autenticado | Acceder rutas por rol indebido | `authMiddleware` + `authorizeRoles` | `server.ts`, `role.middleware.ts` | 95-96, 8-45 |
| Administrador | Cambios sensibles por error o abuso | Proteccion de auto-desactivacion | `data.routes.ts` | 908-946 |
| Medico | Ver/modificar citas ajenas | Filtros por doctor y checks de agenda | `data.routes.ts` | 565-597, 1221-1520 |
| Recepcionista | Editar datos clinicos ya cerrados | Reglas de cita/paciente completado | `data.routes.ts` | 665-689, 1413-1520 |
| Servicios internos | Respuestas externas con datos sensibles | Logging sin body completo | `cita.service.ts` | 140-154 |
| APIs externas | OAuth/Supabase | Validacion token Supabase | `auth.service.ts` | 84-105 |

## 6. Entry Points

| Entry point | Riesgo | Control | Evidencia | Lineas aprox. |
|---|---|---|---|---:|
| Login | Fuerza bruta, credenciales invalidas | Zod + rate limit + mensaje generico | `auth.schema.ts`, `auth.routes.ts`, `auth.controller.ts` | 33-36, 24-35, 45-70 |
| Registro | Datos invalidos o rol indebido | Zod enum de roles + rate limit | `auth.schema.ts`, `auth.routes.ts` | 8-31, 19-36 |
| Google session | Token falso | Supabase `getUser` + rate limit | `auth.service.ts`, `auth.routes.ts` | 84-105, 35 |
| Formularios pacientes | Datos invalidos | Validacion manual backend | `data.routes.ts` | 318-347 |
| Formularios medicos | Datos invalidos | Validacion manual backend | `data.routes.ts` | 382-423 |
| JSON request bodies | Campos extra o tipo invalido | `pickPayload` y validadores | `data.routes.ts` | 431-540 |
| URL params `:id` | Enumeracion o input invalido | UUID middleware | `security.middleware.ts`, `data.routes.ts` | 88-110, 6 |
| Cookies | CSRF si fueran auth automaticas | Auth usa Bearer; cookie UI no autoriza API | `api-client.ts`, `sidebar.tsx` | 51-75, 73 |
| Panel admin | Escalada de privilegios | `authorizeRoles('admin')` | `data.routes.ts` | 796-946 |
| `/api/metrics` | Exposicion de metricas | No secretos; endpoint publico para demo | `metrics.ts`, `server.ts` | 40-95, 88-90 |

## 7. Trust Boundaries

| Boundary | Riesgo | Control | Evidencia | Lineas aprox. |
|---|---|---|---|---:|
| Navegador -> backend | Input no confiable | Zod/manual validation, JWT, CORS | `auth.schema.ts`, `data.routes.ts`, `server.ts` | varios |
| Backend -> base de datos | Injection o datos invalidos | Supabase query builder + whitelists | `data.routes.ts` | 8-18, 431-540 |
| Backend -> servicios externos | Respuestas con datos sensibles | Log seguro sin body completo | `cita.service.ts` | 140-154 |
| Frontend role display -> backend permission | Confiar solo en UI | Backend aplica roles | `role.middleware.ts`, `data.routes.ts` | 8-45, varios |
| CI/CD -> secrets | Filtrar secretos en logs | `permissions: contents: read`, secrets context | workflows | 1-80 aprox. |

## 8. Attack Surface

Superficie principal:

- API Express bajo `/api`.
- Endpoints publicos de autenticacion.
- Formularios de registro, login, citas, pacientes, medicos y perfiles.
- Parametros `:id` en rutas de citas, pacientes, historial y administracion.
- Tokens en `Authorization: Bearer`.
- Variables de entorno para JWT, Supabase y DB.
- Workflows CI/CD y Docker.

No se observaron uploads de archivos ni renderizado de HTML de usuario. Existe `dangerouslySetInnerHTML` en `frontend/src/app/components/ui/chart.tsx`, pero se usa para inyectar CSS generado por configuracion de charts, no HTML ingresado por usuario.

## 9. OWASP Top 10 Aplicado

| OWASP | Revision en ClinicPRO | Estado | Evidencia | Pendiente |
|---|---|---|---|---|
| A01 Broken Access Control | Roles y checks de medico/recepcion/admin | Parcial-alto | `role.middleware.ts`, `data.routes.ts` | Mas ownership checks por paciente si crece el modelo |
| A02 Cryptographic Failures | bcrypt, JWT expirado, refresh hash | Cumple basico | `auth.service.ts`, `jwt.ts` | Rotacion de secretos y cookies HttpOnly futuras |
| A03 Injection | Supabase query builder, whitelists | Cumple basico | `data.routes.ts` | Pruebas negativas adicionales |
| A04 Insecure Design | Trust boundaries documentadas | Parcial | este archivo | Threat modeling mas formal |
| A05 Security Misconfiguration | Headers, CORS, `.env` ignorado | Mejorado | `security.middleware.ts`, `server.ts`, `.gitignore` | Revisar CSP en frontend prod |
| A06 Vulnerable Components | Lockfiles y `npm audit` | Mejorado | `package-lock.json`, package scripts, CI | Atender hallazgos de audit |
| A07 Auth Failures | bcrypt, JWT, rate limit | Mejorado | `auth.*`, `security.middleware.ts` | MFA o bloqueo gradual futuro |
| A08 Software/Data Integrity | CI con npm ci y audit | Mejorado | workflows | Pinning por SHA de actions |
| A09 Logging/Monitoring Failures | Logs seguridad integrados | Mejorado | `logger.ts`, `auth.middleware.ts`, `security.middleware.ts` | Enviar logs a SIEM/Sentry |
| A10 SSRF | No se observaron fetchs controlados por usuario | Bajo por ahora | `cita.service.ts` usa env URL | Validar allowlist si se exponen URLs |

## 10. Controles Existentes

- Password hashing con bcrypt.
- JWT access/refresh con expiracion.
- Refresh token guardado como hash SHA-256.
- Middleware `authMiddleware` para rutas privadas.
- Middleware `authorizeRoles` para admin/medico/recepcionista.
- Validacion Zod en auth.
- Validaciones manuales para pacientes, medicos, clinicas, citas e historial.
- Query builder de Supabase en lugar de SQL concatenado.
- Logger estructurado con redaccion de campos sensibles.
- Error handler centralizado y mensajes seguros.
- `.env` ignorado por Git.
- Workflows con permisos minimos `contents: read`.

## 11. Fixes Aplicados

| Fix | Riesgo reducido | Archivo | Lineas aproximadas | Como probar | Que decir en defensa |
|---|---|---|---:|---|---|
| Security headers | Clickjacking, MIME sniffing, leakage de referrer, permisos del navegador | `backend/src/middleware/security.middleware.ts`, `backend/src/server.ts` | 25-50, 47-49 | `curl -i /api/health` y revisar headers | "Agregue una base equivalente a Helmet sin depender de credenciales externas." |
| Rate limiting auth | Fuerza bruta y abuso de endpoints publicos | `security.middleware.ts`, `auth.routes.ts` | 52-86, 19-36 | Enviar pocas solicitudes repetidas localmente; no ataques agresivos | "Login tiene limite mas estricto que auth general." |
| UUID param validation | Input invalido, enumeracion ruidosa y errores DB innecesarios | `security.middleware.ts`, `data.routes.ts` | 88-110, 6 | `curl /api/citas/paciente/not-a-uuid` con token valido | "El backend rechaza IDs mal formados antes de consultar DB." |
| CORS explicito | Origenes/headers demasiado amplios | `server.ts` | 51-66 | Revisar `ALLOWED_ORIGINS` y preflight | "CORS usa allowlist y no reemplaza autorizacion." |
| Dependency audit script/CI | Componentes vulnerables sin revisar | `backend/package.json`, `frontend/package.json`, workflows | scripts + steps | `npm run audit` | "El scan queda repetible en local y CI." |
| Dependency audit fix | Vulnerabilidades conocidas en dependencias npm | `backend/package-lock.json`, `frontend/package-lock.json` | lockfiles | `npm run audit` | "No actualice paquetes mayores a ciegas; use el fix compatible de npm." |

## 12. Evidencia por Tema

| Tema | Archivo/carpeta | Lineas aproximadas | Que mostrar | Que decir |
|---|---|---:|---|---|
| Autenticacion | `backend/src/modules/auth/auth.service.ts` | 120-170 | bcrypt + login | "Las contrasenas no se guardan en texto plano." |
| JWT | `backend/src/utils/jwt.ts` | 10-40 | expiracion | "Los tokens tienen expiracion por env." |
| Refresh token hash | `auth.service.ts` | 24-70, 250-290 | SHA-256 | "No guardo el refresh token completo." |
| Autorizacion | `backend/src/middleware/role.middleware.ts` | 8-45 | 401/403 | "No confio solo en el frontend." |
| Middleware seguridad | `backend/src/middleware/security.middleware.ts` | 25-110 | headers, rate limit, UUID | "Tres controles nuevos en un punto central." |
| Validacion entrada | `backend/src/modules/auth/auth.schema.ts` | 8-47 | Zod | "Login/registro validan body." |
| Validacion dominio | `backend/src/modules/data/data.routes.ts` | 318-423 | validadores | "Pacientes, medicos y citas tienen reglas." |
| Acceso DB | `data.routes.ts` | 545-787 | Supabase query builder | "No hay SQL concatenado desde input." |
| CORS | `backend/src/server.ts` | 23-66 | allowlist | "Produccion queda cerrada a origenes configurados." |
| Security headers | `server.ts`, `security.middleware.ts` | 47-49, 25-50 | headers | "Mitiga misconfiguration basica." |
| Rate limiting | `auth.routes.ts` | 19-36 | limits auth/login | "Protege endpoints publicos." |
| Error handler | `backend/src/middleware/error.middleware.ts` | 29-61 | mensajes seguros | "Stack no va al cliente." |
| Secrets | `.gitignore`, `backend/.env.example` | 4-8, 1-24 | env ignorado | "No versiono secretos reales." |
| Dependency scan | `package.json`, workflows | scripts/steps | `npm audit` | "La revision se puede repetir." |
| GitHub Actions | `.github/workflows/*` | permisos + audit | CI | "Permisos minimos y audit." |
| Logs seguridad | `auth.middleware.ts`, `role.middleware.ts`, `security.middleware.ts` | varios | auth failure/rate limit | "Eventos relevantes quedan en logs sin tokens." |
| README | `README.md` | Web Security | resumen | "Guia operacional para Week 18." |

## 13. Secretos Revisados

Hallazgos:

- `.env` y `.env.*` estan ignorados, excepto `.env.example`.
- `backend/.env.example` usa placeholders, no secretos reales.
- `docker-compose.yml` carga `backend/.env` por `env_file`, no hardcodea claves reales.
- GitHub Actions usa valores de CI de ejemplo y `secrets.GITHUB_TOKEN` para GHCR.
- Frontend solo tiene variables `VITE_API_*`, que son URLs publicas, no secretos.

Pendiente:

- Si alguna vez hubo secretos reales en Git, rotarlos fuera de esta revision.
- Usar secret manager/plataforma cloud para produccion.

## 14. Dependencias Revisadas

Evidencia:

- Backend y frontend tienen `package-lock.json`.
- Se agrego `npm run audit` en `backend/package.json` y `frontend/package.json`.
- Se agregaron pasos de dependency audit en workflows.
- `npm audit fix` actualizo lockfiles.
- `npm run audit` reporto `found 0 vulnerabilities` en backend y frontend despues del fix.

Comandos:

```bash
cd backend
npm run audit

cd ../frontend
npm run audit
```

No se actualizaron paquetes mayores manualmente sin analisis. Se uso `npm audit fix` para aplicar correcciones compatibles con el arbol actual.

## 15. Manejo de Errores

Antes:

- Ya existia handler global de Week 16.
- Algunas respuestas de servicios/DB podian devolver mensajes de error de proveedor.

Despues:

- Se mantiene `errorHandler` central con respuesta generica para 500.
- Los nuevos controles devuelven 400 o 429 seguros.
- Los detalles internos van a logs estructurados.

Pendiente:

- Unificar todos los endpoints para no devolver `error.message` de Supabase en rutas especificas.

## 16. XSS y CSRF

XSS:

- React escapa texto por defecto.
- No se observo `innerHTML` con input de usuario.
- `dangerouslySetInnerHTML` aparece en un componente de charts para CSS generado por configuracion, no para HTML ingresado por usuario.
- Se agrego CSP inicial en backend para respuestas API.

CSRF:

- La autenticacion principal usa `Authorization: Bearer`, no cookies automaticas de navegador.
- Esto reduce el riesgo CSRF clasico comparado con sesiones en cookies.
- Igual se mantiene CORS por allowlist y autorizacion backend.
- Si se migran tokens a cookies HttpOnly, agregar CSRF token o SameSite estricto segun flujo.

## 17. Riesgos Restantes

| Riesgo restante | Impacto | Mitigacion actual | Mejora futura |
|---|---|---|---|
| Tokens en localStorage | XSS podria robar tokens | No renderizar HTML usuario + CSP inicial | Migrar refresh token a cookie HttpOnly/SameSite/Secure |
| Mensajes DB en algunas rutas | Filtracion de detalles internos | Error handler global para errores no capturados | Normalizar respuestas de Supabase |
| Rate limit en memoria | Se reinicia con proceso y no escala multi-instancia | Suficiente para demo local | Redis/gateway rate limit |
| CSP inicial | Puede requerir ajuste para frontend productivo | Protege respuestas API | CSP especifica en Nginx/frontend |
| Actions no pineadas por SHA | Riesgo supply chain teorico | Versiones oficiales y permisos minimos | Pinning por commit SHA |
| No hay DAST real | No prueba navegador/ataques dinamicos | Revision manual + tests | OWASP ZAP baseline en entorno local/staging |

## 18. Que Mejoraria Despues

- Migrar refresh token a cookie HttpOnly, Secure y SameSite.
- Agregar Redis o gateway para rate limiting distribuido.
- Agregar OWASP ZAP baseline contra entorno local/staging.
- Agregar Trivy para imagenes Docker.
- Pinnear GitHub Actions por SHA.
- Centralizar respuestas de error de DB.
- Agregar auditoria de cambios administrativos.
- Activar RLS en Supabase si se expone acceso directo desde clientes.

## 19. Comandos de Verificacion

| Comando | Donde ejecutarlo | Para que sirve | Resultado esperado |
|---|---|---|---|
| `npm ci` | `backend/` | Instalar dependencias desde lockfile | Instalacion reproducible |
| `npm run build` | `backend/` | Compilar TypeScript | Sin errores |
| `npm test` | `backend/` | Ejecutar tests backend | Tests pasan |
| `npm run test:smoke` | `backend/` | Verificar archivos/controles clave | Smoke pasa |
| `npm run audit` | `backend/` | Revisar vulnerabilidades npm | Sin high/critical o hallazgos documentados |
| `npm ci` | `frontend/` | Instalar frontend | Instalacion reproducible |
| `npm run build` | `frontend/` | Compilar frontend | Sin errores |
| `npm test` | `frontend/` | Tests frontend | Tests pasan |
| `npm run audit` | `frontend/` | Revisar vulnerabilidades npm | Sin high/critical o hallazgos documentados |
| `docker compose up --build` | raiz | Probar stack local | Frontend/backend levantan |
| `curl -i http://localhost:3001/api/health` | raiz | Revisar health + headers | 200 y security headers |
| `curl -i -H "x-request-id: sec-demo" http://localhost:3001/api/health` | raiz | Revisar requestId | Header `x-request-id` |
| `curl -i http://localhost:3001/api/citas/paciente/not-a-uuid` | raiz, con backend | Probar UUID guard | 401 sin token o 400 con token valido |
| Repetir login local pocas veces | entorno local | Ver rate limit sin ataque agresivo | 401 normal; tras limite, 429 |

## 20. Preguntas y Respuestas para Defensa

Pregunta 1: Por que importa la seguridad web?
Respuesta recomendada: Porque protege datos, cuentas y continuidad operativa frente a riesgos comunes como acceso indebido, injection o robo de tokens.
Donde senalar en el proyecto: resumen y controles.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: 1-30.
Comentario para defensa: "La revision reduce riesgos comunes, pero no garantiza seguridad absoluta."

Pregunta 2: Que assets protege tu proyecto?
Respuesta recomendada: Usuarios, passwords hasheadas, tokens, datos personales, registros administrativos, claves de configuracion y base de datos.
Donde senalar en el proyecto: Assets.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: seccion 4.
Comentario para defensa: "Primero identifique que debo proteger."

Pregunta 3: Cuales son tus entry points?
Respuesta recomendada: Login, registro, Google session, formularios, JSON bodies, parametros URL, panel admin y endpoints API.
Donde senalar en el proyecto: Entry Points.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: seccion 6.
Comentario para defensa: "Todo input externo se trata como no confiable."

Pregunta 4: Que es una trust boundary?
Respuesta recomendada: Es el limite donde cambia el nivel de confianza, por ejemplo navegador a backend o backend a base de datos.
Donde senalar en el proyecto: Trust Boundaries.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: seccion 7.
Comentario para defensa: "Ahi aplico validacion y autorizacion."

Pregunta 5: Que significa attack surface?
Respuesta recomendada: Es el conjunto de puntos donde un atacante podria interactuar con el sistema.
Donde senalar en el proyecto: Attack Surface.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: seccion 8.
Comentario para defensa: "No solo revise login; tambien APIs, CI y config."

Pregunta 6: Que es least privilege?
Respuesta recomendada: Dar a cada rol solo los permisos necesarios.
Donde senalar en el proyecto: roles backend.
Archivo: `backend/src/middleware/role.middleware.ts`.
Lineas aproximadas: 8-45.
Comentario para defensa: "Admin, medico y recepcionista no comparten permisos completos."

Pregunta 7: Que significa deny by default?
Respuesta recomendada: Rechazar acceso si no se cumple autenticacion o rol permitido.
Donde senalar en el proyecto: server y role middleware.
Archivo: `backend/src/server.ts`, `role.middleware.ts`.
Lineas aproximadas: 95-96, 8-45.
Comentario para defensa: "Las rutas `/api` pasan primero por auth."

Pregunta 8: Que es OWASP Top 10?
Respuesta recomendada: Una lista de las categorias mas importantes de riesgos web.
Donde senalar en el proyecto: OWASP Top 10.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: seccion 9.
Comentario para defensa: "La use como checklist, no como certificacion."

Pregunta 9: Que riesgos OWASP revisaste?
Respuesta recomendada: Access control, crypto failures, injection, misconfiguration, vulnerable components, auth failures, logging y SSRF.
Donde senalar en el proyecto: tabla OWASP.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: seccion 9.
Comentario para defensa: "Algunos cumplen basico y otros quedan como pendientes."

Pregunta 10: Que es broken access control?
Respuesta recomendada: Cuando un usuario puede acceder o modificar recursos sin permiso.
Donde senalar en el proyecto: role middleware y checks de citas.
Archivo: `backend/src/modules/data/data.routes.ts`.
Lineas aproximadas: 565-597, 1221-1520.
Comentario para defensa: "Un medico no debe modificar citas ajenas."

Pregunta 11: Como proteges rutas privadas?
Respuesta recomendada: El backend monta `/api` con `authMiddleware` y despues aplica roles por endpoint.
Donde senalar en el proyecto: server.
Archivo: `backend/src/server.ts`.
Lineas aproximadas: 95-96.
Comentario para defensa: "No basta ocultar botones en React."

Pregunta 12: Como verificas autorizacion en backend?
Respuesta recomendada: Uso `authorizeRoles` y checks especificos de medico/recepcionista segun recurso.
Donde senalar en el proyecto: role middleware y data routes.
Archivo: `backend/src/middleware/role.middleware.ts`.
Lineas aproximadas: 8-45.
Comentario para defensa: "Las decisiones sensibles se toman del lado servidor."

Pregunta 13: Que diferencia hay entre autenticacion y autorizacion?
Respuesta recomendada: Autenticacion confirma quien eres; autorizacion decide que puedes hacer.
Donde senalar en el proyecto: auth middleware y role middleware.
Archivo: `auth.middleware.ts`, `role.middleware.ts`.
Lineas aproximadas: varios.
Comentario para defensa: "JWT autentica; roles autorizan."

Pregunta 14: Que es SQL injection?
Respuesta recomendada: Inyectar SQL malicioso en consultas construidas con strings no confiables.
Donde senalar en el proyecto: data routes.
Archivo: `backend/src/modules/data/data.routes.ts`.
Lineas aproximadas: 545-787.
Comentario para defensa: "Uso Supabase query builder, no concatenacion SQL."

Pregunta 15: Como evitas injection?
Respuesta recomendada: Uso query builder, whitelists de tablas/campos y validacion de inputs.
Donde senalar en el proyecto: allowedTables y pickPayload.
Archivo: `backend/src/modules/data/data.routes.ts`.
Lineas aproximadas: 8-18, 431-540.
Comentario para defensa: "No acepto nombres de tablas arbitrarios."

Pregunta 16: Que es XSS?
Respuesta recomendada: Ejecucion de script malicioso en el navegador por renderizar contenido no confiable.
Donde senalar en el proyecto: XSS section.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: seccion 16.
Comentario para defensa: "React escapa texto por defecto."

Pregunta 17: Como evitas XSS?
Respuesta recomendada: No renderizo HTML de usuario, uso React escaping y agregue CSP inicial en backend.
Donde senalar en el proyecto: security headers.
Archivo: `backend/src/middleware/security.middleware.ts`.
Lineas aproximadas: 25-50.
Comentario para defensa: "El riesgo sigue siendo importante por localStorage."

Pregunta 18: Que es CSRF?
Respuesta recomendada: Forzar al navegador autenticado a enviar una accion no deseada usando cookies automaticas.
Donde senalar en el proyecto: auth storage/API client.
Archivo: `frontend/src/services/api-client.ts`.
Lineas aproximadas: 51-75.
Comentario para defensa: "Bearer en Authorization reduce CSRF clasico."

Pregunta 19: Tu proyecto esta expuesto a CSRF? Por que?
Respuesta recomendada: Menos que una app con cookies de sesion porque usa Authorization Bearer, pero si se migra a cookies hay que agregar CSRF/SameSite.
Donde senalar en el proyecto: CSRF section.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: seccion 16.
Comentario para defensa: "CORS tampoco reemplaza autorizacion."

Pregunta 20: Que son security headers?
Respuesta recomendada: Cabeceras que reducen riesgos del navegador como clickjacking, sniffing y permisos no deseados.
Donde senalar en el proyecto: security middleware.
Archivo: `backend/src/middleware/security.middleware.ts`.
Lineas aproximadas: 25-50.
Comentario para defensa: "Equivalente basico a Helmet."

Pregunta 21: Que headers agregaste?
Respuesta recomendada: CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy y HSTS en produccion.
Donde senalar en el proyecto: security middleware.
Archivo: `backend/src/middleware/security.middleware.ts`.
Lineas aproximadas: 30-47.
Comentario para defensa: "HSTS solo se activa en produccion."

Pregunta 22: Para que sirve rate limiting?
Respuesta recomendada: Limita abuso y fuerza bruta, especialmente en login y endpoints publicos.
Donde senalar en el proyecto: auth routes.
Archivo: `backend/src/modules/auth/auth.routes.ts`.
Lineas aproximadas: 19-36.
Comentario para defensa: "No hice pruebas agresivas."

Pregunta 23: Donde aplicaste rate limiting?
Respuesta recomendada: En login, Google session, register, refresh, logout y endpoints publicos de Google.
Donde senalar en el proyecto: auth routes.
Archivo: `backend/src/modules/auth/auth.routes.ts`.
Lineas aproximadas: 30-36.
Comentario para defensa: "Login tiene limite mas estricto."

Pregunta 24: Como manejas errores sin filtrar informacion?
Respuesta recomendada: El handler central devuelve mensaje generico para 500 y registra detalle internamente con logger redactado.
Donde senalar en el proyecto: error middleware y logger.
Archivo: `backend/src/middleware/error.middleware.ts`.
Lineas aproximadas: 29-61.
Comentario para defensa: "No mando stack trace al cliente en produccion."

Pregunta 25: Donde guardas secretos?
Respuesta recomendada: En variables de entorno fuera del repo; `.env` esta ignorado y `.env.example` usa placeholders.
Donde senalar en el proyecto: `.gitignore`, `.env.example`.
Archivo: `.gitignore`, `backend/.env.example`.
Lineas aproximadas: 4-8, 1-24.
Comentario para defensa: "No invente ni subi credenciales."

Pregunta 26: Por que no se deben subir secretos al repo?
Respuesta recomendada: Porque quedan en historial Git y pueden permitir acceso a DB, tokens o servicios cloud.
Donde senalar en el proyecto: secrets section.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: seccion 13.
Comentario para defensa: "Si se filtra uno, se debe rotar."

Pregunta 27: Como revisaste dependencias vulnerables?
Respuesta recomendada: Agregue `npm run audit` y pasos de audit en CI para backend y frontend.
Donde senalar en el proyecto: package scripts y workflows.
Archivo: `backend/package.json`, `frontend/package.json`, `.github/workflows/*`.
Lineas aproximadas: scripts + audit steps.
Comentario para defensa: "No actualice majors a ciegas."

Pregunta 28: Que fixes aplicaste?
Respuesta recomendada: Headers, rate limiting, UUID param validation, CORS explicito y dependency audit.
Donde senalar en el proyecto: fixes table.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: seccion 11.
Comentario para defensa: "Son cambios concretos y probables de defender."

Pregunta 29: Que riesgo fue el mas importante?
Respuesta recomendada: Auth endpoints publicos sin rate limit y rutas por ID sin validacion central eran riesgos practicos.
Donde senalar en el proyecto: auth routes y data routes.
Archivo: `auth.routes.ts`, `data.routes.ts`.
Lineas aproximadas: 19-36, 6.
Comentario para defensa: "Elegir riesgos reales vale mas que controles decorativos."

Pregunta 30: Que riesgo quedo pendiente?
Respuesta recomendada: Tokens en localStorage y rate limiting en memoria son aceptables para demo, pero no ideales para produccion.
Donde senalar en el proyecto: riesgos restantes.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: seccion 17.
Comentario para defensa: "No digo que sea seguridad absoluta."

Pregunta 31: Que mejorarias si la app fuera publica manana?
Respuesta recomendada: Cookies HttpOnly para refresh, Redis rate limit, CSP frontend, ZAP baseline, Trivy y alertas reales.
Donde senalar en el proyecto: mejoras futuras.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: seccion 18.
Comentario para defensa: "Priorizaria controles operables."

Pregunta 32: Que herramienta usaste o usarias para dynamic security testing?
Respuesta recomendada: Para DAST usaria OWASP ZAP baseline contra entorno local/staging, no contra URLs publicas sin permiso.
Donde senalar en el proyecto: riesgos restantes/mejoras.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: secciones 17-18.
Comentario para defensa: "No hice pruebas agresivas."

Pregunta 33: Por que CORS no reemplaza autorizacion?
Respuesta recomendada: CORS limita navegadores, pero no impide requests desde herramientas o servidores; el backend debe validar token y rol.
Donde senalar en el proyecto: CORS y auth.
Archivo: `backend/src/server.ts`, `role.middleware.ts`.
Lineas aproximadas: 51-66, 8-45.
Comentario para defensa: "CORS es capa adicional, no control principal."

Pregunta 34: Que eventos de seguridad registras?
Respuesta recomendada: Login/token invalidos, acceso denegado, rate limit excedido, parametros invalidos y errores inesperados.
Donde senalar en el proyecto: logger/middlewares.
Archivo: `auth.middleware.ts`, `role.middleware.ts`, `security.middleware.ts`.
Lineas aproximadas: varios.
Comentario para defensa: "No registro tokens ni passwords."

Pregunta 35: Que parte de seguridad depende del framework y que parte es concepto general?
Respuesta recomendada: React ayuda con escaping y Express con middlewares, pero conceptos como least privilege, validation, no secrets y defense in depth son generales.
Donde senalar en el proyecto: controles existentes.
Archivo: `SECURITY_REVIEW.md`.
Lineas aproximadas: seccion 10.
Comentario para defensa: "No dependo solo del framework."

## 21. Checklist Final Week 18

| Requisito Week 18 | Estado | Evidencia | Pendiente |
|---|---|---|---|
| Assets identificados | Cumple | seccion 4 | Ninguno |
| Actors identificados | Cumple | seccion 5 | Ninguno |
| Entry points identificados | Cumple | seccion 6 | Ninguno |
| Trust boundaries identificadas | Cumple | seccion 7 | Ninguno |
| Auth revisada | Cumple | `auth.service.ts`, `jwt.ts` | Cookies HttpOnly futuras |
| Authorization revisada | Cumple parcial | `role.middleware.ts`, `data.routes.ts` | Mas ownership por paciente si aplica |
| Inputs validados | Cumple | Zod + validadores manuales + UUID params | Mas tests negativos |
| Injection mitigado | Cumple basico | Supabase query builder + whitelists | Revisiones futuras |
| XSS revisado | Cumple basico | React escaping + no raw user HTML + CSP inicial | CSP frontend prod |
| CSRF revisado | Cumple documentado | Bearer auth, CORS | CSRF token si cookies auth |
| Secrets revisados | Cumple | `.gitignore`, `.env.example` | Rotar si hubo leaks previos |
| Dependencias revisadas | Mejorado | `npm run audit`, CI steps | Resolver hallazgos |
| Headers de seguridad | Cumple | `security.middleware.ts` | Ajustar CSP si frontend lo requiere |
| Rate limiting | Cumple basico | `auth.routes.ts` | Redis/gateway en prod |
| Manejo seguro de errores | Cumple parcial | `error.middleware.ts` | Uniformar errores Supabase |
| Logs de seguridad | Cumple | auth/role/rate limit logs | SIEM/Sentry futuro |
| Al menos 3 fixes aplicados | Cumple | seccion 11 | Ninguno |
| Riesgos restantes documentados | Cumple | seccion 17 | Ninguno |
| README actualizado | Cumple | `README.md` Web Security | Ninguno |

## 22. Cumplimiento Estimado

Cumplimiento estimado Week 18: alto para una implementacion academica/local defendible.

No es seguridad absoluta. Queda pendiente endurecimiento productivo: cookies HttpOnly, rate limiting distribuido, DAST, image scanning, CSP especifica de frontend y centralizacion de errores de DB.
