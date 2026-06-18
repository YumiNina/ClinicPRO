# DEFENSA Week 16 - Monitoring and Logging

Revision y mejoras aplicadas sobre ClinicPRO el 2026-06-07.

## 1. Resumen Week 16

Week 16 pide demostrar monitoring, logging y observabilidad sin inventar plataformas ni credenciales. ClinicPRO ahora incluye logs estructurados JSON, requestId, health check, metricas basicas Prometheus-compatible, manejo centralizado de errores y documentacion de dashboard/alertas.

No se inventa un dashboard real: se documenta una propuesta defendible que puede implementarse con Render Logs + Sentry o con Prometheus + Grafana.

## 2. Conceptos

Logging: registro de eventos de la aplicacion.

Monitoring: seguimiento de metricas y estado para saber si el sistema funciona.

Observability: capacidad de entender que ocurre dentro del sistema usando logs, metricas y trazas.

Alerting: reglas que notifican cuando una senal requiere accion.

Error tracking: captura y agrupacion de excepciones para priorizar fallos.

## 3. Senales del Proyecto

| Senal | Estado | Evidencia |
|---|---|---|
| Logs | Implementado | `backend/src/utils/logger.ts` |
| Metricas | Implementado | `backend/src/utils/metrics.ts`, `/api/metrics` |
| Traces | No implementado | Se propone OpenTelemetry como mejora futura |
| Health check | Implementado | `backend/src/server.ts` |
| Alertas | Documentadas | README y este archivo |
| Dashboard | Propuesto | README y este archivo |
| Error tracking | Manejo local implementado; Sentry propuesto | `backend/src/middleware/error.middleware.ts` |

## 4. Revision Inicial

Antes de los cambios:

- Existian algunos `console.log` y `console.error`.
- Existia `/api/health`.
- No habia logger estructurado central.
- No habia requestId.
- No habia request logging.
- No habia `/api/metrics`.
- No habia error handler global productivo en `server.ts`.
- No habia dashboard ni alertas documentadas.

## 5. Logs Estructurados Agregados

Archivo principal:

- `backend/src/utils/logger.ts`

Campos incluidos:

- `level`
- `message`
- `timestamp`
- `environment`
- `requestId`
- `method`
- `route`
- `statusCode`
- `durationMs`
- `userId` si aplica
- `error.name`
- `error.message`
- `error.stack` solo fuera de produccion

Eventos importantes:

- `application.started`
- `http.request.received`
- `http.request.completed`
- `http.route.not_found`
- `http.error.unhandled`
- `auth.failure`
- `authorization.failure`
- `external_service.historial_cancellation_failed`
- `external_service.historial_cancellation_error`

## 6. Datos que No se Registran

No se deben loggear:

- Passwords.
- Tokens.
- JWT completos.
- API keys.
- Cookies.
- `DATABASE_URL`.
- Cadenas de conexion.
- Cuerpos completos de respuestas externas.
- Datos clinicos sensibles.
- Datos personales innecesarios.

El logger incluye redaccion por nombre de campo con `sensitiveKeyPattern`.

## 7. Request ID

Implementado en:

- `backend/src/middleware/observability.middleware.ts`

Comportamiento:

- Reutiliza `x-request-id` si viene en headers.
- Genera un UUID si no viene.
- Devuelve `x-request-id` en la respuesta.
- Lo incluye en logs de request y error.

## 8. Health Check

Endpoint:

```txt
GET /api/health
```

Implementado en:

- `backend/src/server.ts`

Respuesta esperada:

```json
{
  "status": "ok",
  "uptime": 123,
  "timestamp": "2026-06-07T00:00:00.000Z",
  "environment": "development"
}
```

Como probar:

```bash
curl http://localhost:3001/api/health
```

## 9. Metricas

Endpoint:

```txt
GET /api/metrics
```

Implementado en:

- `backend/src/utils/metrics.ts`
- `backend/src/server.ts`

Metricas principales:

| Metrica | Tipo | Uso |
|---|---|---|
| `clinicpro_http_requests_total` | counter | Request volume |
| `clinicpro_http_errors_total` | counter | Error rate |
| `clinicpro_http_request_duration_ms_sum` | counter | Latencia acumulada |
| `clinicpro_http_request_duration_ms_count` | counter | Cantidad de mediciones |
| `clinicpro_auth_failures_total` | counter | Fallos de auth/autorizacion |
| `clinicpro_process_uptime_seconds` | gauge | Uptime del proceso |

## 10. Error Handling

Implementado en:

- `backend/src/middleware/error.middleware.ts`

Incluye:

- Handler de 404.
- Handler global de errores.
- Log estructurado con requestId.
- Respuesta segura al cliente.
- Stack trace solo en desarrollo desde el logger.
- Sin exposicion de secretos.

## 11. Dashboard Propuesto

No hay dashboard real configurado. Propuesta defendible:

| Panel | Fuente | Para que sirve |
|---|---|---|
| Requests por minuto | `/api/metrics` | Ver trafico |
| Error rate | `clinicpro_http_errors_total` | Detectar fallos |
| Latencia promedio/p95 | duration sum/count o plataforma | Detectar lentitud |
| Top exception types | logs `http.error.unhandled` | Priorizar errores |
| Health status | `/api/health` | Validar disponibilidad |
| Auth failures | `clinicpro_auth_failures_total` | Revisar login/permisos |

## 12. Alertas Propuestas

Alerta 1: Error rate alto.

- Condicion: errores 5xx > 5% durante 5 minutos.
- Por que importa: puede indicar bug, caida de DB o servicio externo.
- Revisar primero: logs `http.error.unhandled`, deploy reciente, Supabase.
- Responsable: persona que mantiene backend.
- Accion: identificar requestId, ruta afectada y rollback/fix si aplica.
- Ruido: un error aislado durante pruebas manuales no debe alertar.

Alerta 2: Health check fallando.

- Condicion: `/api/health` falla durante 3 minutos.
- Por que importa: el backend no esta disponible.
- Revisar primero: logs de arranque, puerto, variables de entorno, crash.
- Responsable: persona de deploy/infra.
- Accion: reiniciar servicio, revisar secrets, corregir start command.
- Ruido: una falla unica durante redeploy no debe alertar.

Alerta 3: Latencia alta.

- Condicion: p95 > 1500 ms durante 10 minutos.
- Por que importa: usuarios perciben lentitud.
- Revisar primero: rutas lentas, Supabase, servicios externos.
- Responsable: backend y DB.
- Accion: revisar consultas, indices y endpoints.
- Ruido: una carga puntual de seed o demo no debe alertar.

## 13. Stack Elegido

Stack actual:

- Logs estructurados JSON en backend.
- Metricas Prometheus-compatible por `/api/metrics`.
- Health check por `/api/health`.
- Error handling local.
- Dashboard y alertas documentadas.

Por que se eligio:

- No requiere cuenta externa.
- No usa credenciales reales.
- Es portable.
- Sirve en local, Docker y cloud.
- Permite conectar despues herramientas reales.

Ventajas:

- Bajo riesgo.
- Facil de defender.
- Evita sobreingenieria.
- Compatible con Prometheus/Grafana.

Trade-offs:

- Las metricas son en memoria.
- Se pierden al reiniciar el proceso.
- No hay dashboard real hasta conectar una plataforma.
- No hay trazas distribuidas.

Alternativa managed:

- Sentry para error tracking.
- Datadog, New Relic o CloudWatch para logs, metricas y alertas.

Alternativa open-source:

- OpenTelemetry + Prometheus + Grafana + Loki.

## 14. Como Revisar Logs

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

- Revisar logs del servicio backend en Render u otra plataforma.
- Buscar por `requestId`, `message`, `route` o `statusCode`.

## 15. Como Diagnosticar una Falla

1. Probar `/api/health`.
2. Revisar si el cliente tiene header `x-request-id`.
3. Buscar el `requestId` en logs.
4. Revisar `route`, `method`, `statusCode` y `durationMs`.
5. Si hay error, revisar `error.name` y `error.message`.
6. Consultar `/api/metrics`.
7. Comparar request volume, error rate y latencia.
8. Revisar deploy reciente, variables y Supabase.

## 16. Checklist Final

| Requisito Week 16 | Estado | Evidencia | Pendiente |
|---|---|---|---|
| Hay logs estructurados | Cumple | `logger.ts` | Ninguno |
| Logs incluyen contexto util | Cumple | request middleware | Ninguno |
| Logs no exponen secretos | Cumple | redaccion en logger | Revisar antes de nuevos logs |
| Hay requestId | Cumple | `observability.middleware.ts` | Ninguno |
| Hay logs de inicio | Cumple | `application.started` | Ninguno |
| Hay logs de requests | Cumple | `http.request.*` | Ninguno |
| Hay logs de errores | Cumple | `error.middleware.ts` | Ninguno |
| Hay health check | Cumple | `/api/health` | Ninguno |
| Hay tres metricas | Cumple | request volume, errors, latency | Ninguno |
| Hay dashboard | Propuesto | README y este archivo | Conectar Grafana/managed |
| Hay alerta explicada | Cumple | alertas documentadas | Implementar en plataforma real |
| Hay error tracking o handler | Cumple | handler global local | Sentry opcional |
| Stack justificado | Cumple | seccion stack | Ninguno |
| Alternativa mencionada | Cumple | managed/open-source | Ninguno |
| README documenta monitoring | Cumple | README | Ninguno |
| DEFENSA_MONITORING existe | Cumple | este archivo | Ninguno |

## 17. Mapa de Archivos

| Tema | Archivo/carpeta | Lineas aproximadas | Que mostrar | Que decir |
|---|---|---:|---|---|
| Logger | `backend/src/utils/logger.ts` | 1-77 | JSON + redaccion | "Logs estructurados sin secretos." |
| Metricas | `backend/src/utils/metrics.ts` | 1-95 | counters y render Prometheus | "Expone volumen, errores y latencia." |
| Request logging | `backend/src/middleware/observability.middleware.ts` | 1-91 | requestId y duration | "Cada request queda trazable." |
| Error handler | `backend/src/middleware/error.middleware.ts` | 1-57 | 404 y errores globales | "Respuesta segura y log con contexto." |
| Health check | `backend/src/server.ts` | endpoint `/api/health` | status, uptime, timestamp | "Sirve para validar disponibilidad." |
| Metrics endpoint | `backend/src/server.ts` | endpoint `/api/metrics` | text/plain Prometheus | "Sirve para dashboard." |
| Auth failures | `backend/src/middleware/auth.middleware.ts` | 1-80 aprox. | `auth.failure` | "No registra tokens." |
| Authorization | `backend/src/middleware/role.middleware.ts` | 1-45 aprox. | `authorization.failure` | "Registra permisos rechazados." |
| External service logs | `backend/src/modules/citas/cita.service.ts` | 130-155 aprox. | fallo historial sin body externo | "Servicios externos quedan observables sin exponer respuestas completas." |
| README | `README.md` | Monitoring section | dashboard/alertas | "Documenta operacion." |
| Smoke test | `backend/scripts/ci-smoke-test.js` | 1-95 aprox. | asserts observability | "CI verifica que no se pierda." |
| Defensa | `DEFENSA_MONITORING.md` | todo | checklist y preguntas | "Material de defensa Week 16." |

## 18. Preguntas y Respuestas

Pregunta 1: Por que importan monitoring y logging?
Respuesta recomendada: Porque permiten detectar fallos, investigar errores y demostrar que el sistema esta funcionando.
Donde señalar en el proyecto: README Monitoring.
Archivo: `README.md`.
Lineas aproximadas: seccion Monitoring.
Comentario para defensa: "No basta que compile; debo poder operarlo."

Pregunta 2: Que diferencia hay entre logging y monitoring?
Respuesta recomendada: Logging registra eventos; monitoring observa metricas y estado en el tiempo.
Donde señalar en el proyecto: este archivo.
Archivo: `DEFENSA_MONITORING.md`.
Lineas aproximadas: 9-20.
Comentario para defensa: "Son complementarios."

Pregunta 3: Que es observability?
Respuesta recomendada: Es entender el comportamiento interno mediante logs, metricas y trazas.
Donde señalar en el proyecto: senales del proyecto.
Archivo: `DEFENSA_MONITORING.md`.
Lineas aproximadas: 22-34.
Comentario para defensa: "Tengo logs y metricas; trazas son mejora futura."

Pregunta 4: Que son logs estructurados?
Respuesta recomendada: Logs con campos consistentes como JSON, no texto suelto.
Donde señalar en el proyecto: logger.
Archivo: `backend/src/utils/logger.ts`.
Lineas aproximadas: 42-77.
Comentario para defensa: "Se pueden filtrar por requestId, route o statusCode."

Pregunta 5: Por que un log como "algo fallo" no sirve?
Respuesta recomendada: Porque no indica ruta, requestId, error, usuario afectado ni contexto para investigar.
Donde señalar en el proyecto: request logging.
Archivo: `backend/src/middleware/observability.middleware.ts`.
Lineas aproximadas: 45-89.
Comentario para defensa: "Mis logs incluyen contexto."

Pregunta 6: Que campos tienen tus logs?
Respuesta recomendada: level, message, timestamp, environment, requestId, method, route, statusCode, durationMs, userId si aplica y error seguro.
Donde señalar en el proyecto: README.
Archivo: `README.md`.
Lineas aproximadas: Monitoring section.
Comentario para defensa: "Campos utiles sin datos sensibles."

Pregunta 7: Que datos no debes registrar?
Respuesta recomendada: Passwords, tokens, JWT, API keys, cookies, DATABASE_URL, secretos y datos clinicos sensibles.
Donde señalar en el proyecto: logger redaction.
Archivo: `backend/src/utils/logger.ts`.
Lineas aproximadas: 14-39.
Comentario para defensa: "El logger redacta por nombre de campo."

Pregunta 8: Que es requestId?
Respuesta recomendada: Es un identificador por solicitud para rastrearla en todos los logs.
Donde señalar en el proyecto: middleware.
Archivo: `backend/src/middleware/observability.middleware.ts`.
Lineas aproximadas: 31-43.
Comentario para defensa: "Tambien se devuelve como header."

Pregunta 9: Para que sirve /health?
Respuesta recomendada: Sirve para verificar que el backend esta vivo y listo para recibir trafico.
Donde señalar en el proyecto: server.
Archivo: `backend/src/server.ts`.
Lineas aproximadas: endpoint `/api/health`.
Comentario para defensa: "Es el primer chequeo post-deploy."

Pregunta 10: Que metricas basicas usa tu proyecto?
Respuesta recomendada: Request volume, error rate y response latency.
Donde señalar en el proyecto: metrics.
Archivo: `backend/src/utils/metrics.ts`.
Lineas aproximadas: 1-95.
Comentario para defensa: "Son las tres metricas minimas de Week 16."

Pregunta 11: Que es request volume?
Respuesta recomendada: Cantidad de requests recibidos por metodo, ruta y status.
Donde señalar en el proyecto: `clinicpro_http_requests_total`.
Archivo: `backend/src/utils/metrics.ts`.
Lineas aproximadas: 35-47.
Comentario para defensa: "Mide trafico."

Pregunta 12: Que es error rate?
Respuesta recomendada: Proporcion de requests que fallan, especialmente 5xx.
Donde señalar en el proyecto: `clinicpro_http_errors_total`.
Archivo: `backend/src/utils/metrics.ts`.
Lineas aproximadas: 49-53.
Comentario para defensa: "Alerta si supera 5%."

Pregunta 13: Que es response latency?
Respuesta recomendada: Tiempo que tarda el servidor en responder.
Donde señalar en el proyecto: duration middleware.
Archivo: `backend/src/middleware/observability.middleware.ts`.
Lineas aproximadas: 53-89.
Comentario para defensa: "Se guarda en `durationMs` y en metricas."

Pregunta 14: Que dashboard tienes o propones?
Respuesta recomendada: Propongo un dashboard con requests/min, error rate, latencia, top exceptions, health y auth failures.
Donde señalar en el proyecto: README.
Archivo: `README.md`.
Lineas aproximadas: Monitoring section.
Comentario para defensa: "No invento dashboard real."

Pregunta 15: Que alerta tienes o propones?
Respuesta recomendada: Error rate > 5% durante 5 minutos, health fallando 3 minutos y latencia p95 alta.
Donde señalar en el proyecto: alertas.
Archivo: `DEFENSA_MONITORING.md`.
Lineas aproximadas: 180-220.
Comentario para defensa: "Son accionables."

Pregunta 16: Por que una alerta debe ser accionable?
Respuesta recomendada: Porque debe indicar que alguien puede investigar y corregir; si solo mete ruido, se ignora.
Donde señalar en el proyecto: alertas.
Archivo: `DEFENSA_MONITORING.md`.
Lineas aproximadas: 180-220.
Comentario para defensa: "Incluyen que revisar y accion."

Pregunta 17: Que harias si el health check falla?
Respuesta recomendada: Revisar logs de arranque, puerto, variables, crash y ultimo deploy.
Donde señalar en el proyecto: README fallos comunes.
Archivo: `README.md`.
Lineas aproximadas: Monitoring section.
Comentario para defensa: "Primero disponibilidad."

Pregunta 18: Que revisarias si sube el error rate?
Respuesta recomendada: Logs `http.error.unhandled`, rutas afectadas, Supabase, servicio externo y deploy reciente.
Donde señalar en el proyecto: error handler.
Archivo: `backend/src/middleware/error.middleware.ts`.
Lineas aproximadas: 29-57.
Comentario para defensa: "Busco por requestId."

Pregunta 19: Que revisarias si sube la latencia?
Respuesta recomendada: Rutas con mayor durationMs, consultas a Supabase y llamadas externas.
Donde señalar en el proyecto: request logging.
Archivo: `backend/src/middleware/observability.middleware.ts`.
Lineas aproximadas: 53-89.
Comentario para defensa: "durationMs ayuda a ubicar lentitud."

Pregunta 20: Que herramienta managed podrias usar?
Respuesta recomendada: Sentry para errores, Datadog/New Relic/CloudWatch para logs, metricas y alertas.
Donde señalar en el proyecto: stack elegido.
Archivo: `DEFENSA_MONITORING.md`.
Lineas aproximadas: 220-260.
Comentario para defensa: "No requiere cambiar todo el codigo."

Pregunta 21: Que herramienta open-source podrias usar?
Respuesta recomendada: OpenTelemetry + Prometheus + Grafana + Loki.
Donde señalar en el proyecto: alternativas.
Archivo: `DEFENSA_MONITORING.md`.
Lineas aproximadas: 260-270.
Comentario para defensa: "Es portable."

Pregunta 22: Que es OpenTelemetry?
Respuesta recomendada: Un estandar para instrumentar logs, metricas y trazas de forma portable.
Donde señalar en el proyecto: alternativa futura.
Archivo: `DEFENSA_MONITORING.md`.
Lineas aproximadas: 260-270.
Comentario para defensa: "Seria el siguiente paso para trazas."

Pregunta 23: Que diferencia hay entre logs, metricas y trazas?
Respuesta recomendada: Logs son eventos; metricas son numeros agregados; trazas siguen una solicitud entre servicios.
Donde señalar en el proyecto: senales.
Archivo: `DEFENSA_MONITORING.md`.
Lineas aproximadas: 22-34.
Comentario para defensa: "Hoy tengo logs y metricas."

Pregunta 24: Que parte seria portable si cambias de proveedor cloud?
Respuesta recomendada: Logs JSON, requestId, `/health`, `/metrics` y convenciones de alertas.
Donde señalar en el proyecto: logger y metrics.
Archivo: `backend/src/utils/logger.ts`, `backend/src/utils/metrics.ts`.
Lineas aproximadas: varios.
Comentario para defensa: "No depende de un proveedor."

Pregunta 25: Que mejorarias si tuvieras mas tiempo?
Respuesta recomendada: Agregaria Sentry u OpenTelemetry, dashboard real en Grafana y alertas configuradas en la plataforma cloud.
Donde señalar en el proyecto: alternativas.
Archivo: `DEFENSA_MONITORING.md`.
Lineas aproximadas: 220-270.
Comentario para defensa: "La base ya esta lista."

## 19. Comandos Para Demostrar

```bash
cd backend
npm run build
npm run test:smoke
npm run start
```

En otra terminal:

```bash
curl -i http://localhost:3001/api/health
curl http://localhost:3001/api/metrics
curl -H "x-request-id: demo-week16" http://localhost:3001/api/health
```

## 20. Resultado Final

Estado general: cumple como implementacion basica y defendible de Week 16.

Validaciones ejecutadas:

| Comando | Resultado |
|---|---|
| `cd backend && npm run build` | Paso |
| `cd backend && npm test` | Paso, 7 tests |
| `cd backend && npm run test:smoke` | Paso |
| `curl -i -H 'x-request-id: demo-week16' http://localhost:3001/api/health` | Paso, devuelve `x-request-id` y `status: ok` |
| `curl -i http://localhost:3001/api/metrics` | Paso, devuelve metricas Prometheus-compatible |

Evidencia local observada:

- Log de inicio `application.started`.
- Log `http.request.received`.
- Log `http.request.completed`.
- `requestId` propagado desde `x-request-id`.
- Metricas `clinicpro_http_requests_total`, `clinicpro_http_errors_total` y latencia.

Pendiente para produccion real:

- Conectar logs a plataforma cloud real.
- Crear dashboard real.
- Crear alertas reales.
- Agregar Sentry u OpenTelemetry si se requiere error tracking avanzado o trazas.
