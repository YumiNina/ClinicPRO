# DEFENSA Week 15.1 - Terraform IaC

Auditoria y correccion realizada sobre ClinicPRO el 2026-06-07.

## 1. Resumen del Tema

Week 15.1 pide demostrar una base defendible de Infrastructure as Code con Terraform. El proyecto no tenia Terraform antes de esta revision: no existian `infra/`, archivos `.tf`, `terraform.tfvars.example`, state ni workflow Terraform.

Se agrego una implementacion segura en `infra/` que documenta la infraestructura esperada, define variables, protege secretos y deja lista la estructura para completar un proveedor cloud real sin inventar credenciales.

## 2. Que es Infrastructure as Code

Infrastructure as Code es la practica de definir infraestructura con archivos versionados. En vez de crear servicios manualmente desde un panel cloud, se describe la infraestructura en codigo para revisarla, repetirla y auditarla.

## 3. Que es Terraform

Terraform es una herramienta de IaC. Lee archivos `.tf`, inicializa providers con `terraform init`, revisa cambios con `terraform plan` y aplica cambios con `terraform apply`.

## 4. Infraestructura vs Aplicacion

Infraestructura:

- Servicios de hosting.
- Base de datos administrada o conexion a Supabase.
- DNS.
- Storage.
- Logs.
- Health checks.
- Variables de plataforma.

Despliegue de aplicacion:

- `npm run build`.
- Publicar imagen Docker o archivos `dist`.
- Configurar variables de runtime.
- Ejecutar smoke test.
- Revisar logs posteriores al deploy.

Terraform prepara infraestructura, pero no reemplaza el build/deploy de la app.

## 5. Configuracion y Secretos

Configuracion:

- `project_name`
- `environment`
- `region`
- `app_name`
- `domain_name`
- `image_tag`
- `app_port`
- `database_name`
- `allowed_origins`

Secretos:

- `database_url`
- `jwt_secret`
- `api_key`

Los secretos estan marcados con `sensitive = true` en `infra/variables.tf` y no tienen valores reales.

## 6. Revision Inicial de Terraform

Resultado de busqueda:

- No existia carpeta `infra/`, `terraform/`, `infrastructure/` ni `iac/`.
- No existian archivos `*.tf`.
- No existia `terraform.tfvars.example`.
- No se encontraron `terraform.tfstate`, `terraform.tfstate.backup`, `.terraform/`, `terraform.tfvars`, private keys ni tfvars reales.

Conclusion: Terraform no existia en el proyecto. Se creo una base nueva y segura en `infra/`.

## 7. Archivos Agregados

| Archivo | Proposito |
|---|---|
| `infra/main.tf` | Documenta el plan de infraestructura, runtime y secretos sin crear recursos reales. |
| `infra/variables.tf` | Define variables reutilizables y sensibles para evitar hardcoding. |
| `infra/outputs.tf` | Expone salidas utiles para defensa sin secretos. |
| `infra/versions.tf` | Define Terraform `>= 1.6.0` y deja preparado `required_providers`. |
| `infra/terraform.tfvars.example` | Ejemplo seguro de variables con placeholders. |
| `infra/README.md` | Documenta IaC, comandos, state, secretos y pendientes. |
| `DEFENSA_TERRAFORM.md` | Guia de defensa Week 15.1. |
| `.github/workflows/terraform.yml` | Valida Terraform en PR y manualmente sin `apply` automatico. |

## 8. Recursos Preparados

El proyecto no crea infraestructura real porque no hay credenciales ni provider cloud real definido. En su lugar, `infra/main.tf` deja documentado un plan seguro:

- Hosting service para backend y frontend.
- Base de datos administrada o Supabase PostgreSQL externo.
- Container registry o servicio de contenedores opcional.
- Storage opcional.
- DNS opcional.
- Observabilidad con logs y health checks.

## 9. Como Revisar Cambios

Comando:

```bash
cd infra
terraform plan
```

`terraform plan` muestra que cambiaria antes de aplicar. Es el comando que se debe mostrar para defender que Terraform permite revisar cambios de infraestructura sin ejecutarlos directamente.

## 10. Como Aplicar Cambios

Comando:

```bash
cd infra
terraform apply
```

`terraform apply` crea o actualiza infraestructura. En este proyecto debe ejecutarse solo cuando se configure un provider real y se revisen los cambios del plan.

## 11. Terraform State

Terraform state es el archivo donde Terraform guarda el estado de los recursos administrados. Puede incluir IDs, metadata y, segun el provider, informacion sensible.

Por eso no se debe subir:

- `.terraform/`
- `*.tfstate`
- `*.tfstate.*`
- `terraform.tfvars`
- `*.tfvars`

El repositorio permite subir `terraform.tfvars.example` porque no contiene secretos reales.

## 12. Secretos Fuera del Repositorio

No deben subirse:

- `DATABASE_URL`
- JWT secrets reales.
- API keys.
- Access tokens.
- Private keys.
- Passwords de proveedores cloud.

Donde configurarlos:

- GitHub Actions secrets.
- Secret manager del proveedor cloud.
- Variables protegidas de Render u otra plataforma.
- `terraform.tfvars` local ignorado por Git.

## 13. Workflow Terraform

El workflow `.github/workflows/terraform.yml` es seguro:

- Corre en `pull_request` cuando cambia `infra/**`.
- Corre manualmente con `workflow_dispatch`.
- Ejecuta `terraform fmt -check -recursive`.
- Ejecuta `terraform init`.
- Ejecuta `terraform validate`.
- Ejecuta `terraform plan`.
- No ejecuta `terraform apply` automaticamente.

## 14. Checklist de Cumplimiento

| Requisito Week 15.1 | Estado | Evidencia | Pendiente |
|---|---|---|---|
| Existe carpeta `infra/` | Cumple | `infra/` | Ninguno |
| Existen archivos `.tf` | Cumple | `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf` | Ninguno |
| Hay variables para evitar hardcoding | Cumple | `infra/variables.tf` | Ajustar valores reales por entorno |
| Hay variables sensibles | Cumple | `database_url`, `jwt_secret`, `api_key` con `sensitive = true` | Cargar secretos fuera de Git |
| Hay outputs utiles | Cumple | `infra/outputs.tf` | Agregar URL real si se crea recurso cloud |
| Hay provider o plantilla preparada | Cumple parcial | `infra/versions.tf` sin provider real por seguridad | Elegir provider real |
| Hay documentacion de comandos | Cumple | `infra/README.md`, `README.md` | Ninguno |
| Se explica `terraform plan` | Cumple | `infra/README.md`, este archivo | Ninguno |
| Se explica `terraform apply` | Cumple | `infra/README.md`, este archivo | Ninguno |
| Se explica Terraform state | Cumple | `infra/README.md`, este archivo | Ninguno |
| `.gitignore` protege state/tfvars | Cumple | `.gitignore` | Ninguno |
| No hay secretos reales | Cumple segun busqueda local | No se encontraron tfvars/state/keys | Revisar antes de cada push |
| README explica IaC | Cumple | `README.md` | Ninguno |
| Preguntas y respuestas de defensa | Cumple | este archivo | Ninguno |

## 15. Mapa de Archivos Para Defensa

| Tema | Archivo/carpeta | Lineas aproximadas | Que mostrar | Que decir |
|---|---|---:|---|---|
| Carpeta IaC | `infra/` | todo | Estructura de archivos | "Aqui esta la infraestructura como codigo." |
| Plan de infraestructura | `infra/main.tf` | 1-74 | `locals` y comentarios | "No crea recursos reales sin provider; documenta lo esperado." |
| Variables | `infra/variables.tf` | 1-96 | Variables y validaciones | "Evito hardcoding y separo secretos." |
| Variables sensibles | `infra/variables.tf` | 77-96 | `sensitive = true` | "No hago output ni subo valores reales." |
| Outputs | `infra/outputs.tf` | 1-38 | Salidas no sensibles | "Muestro informacion util sin secretos." |
| Versiones | `infra/versions.tf` | 1-23 | `required_version` | "Provider real queda preparado, no inventado." |
| Ejemplo tfvars | `infra/terraform.tfvars.example` | 1-18 | Placeholders | "Es un ejemplo seguro, no contiene secretos reales." |
| Docs infra | `infra/README.md` | 1-111 | Comandos y state | "Explica como usar Terraform y proteger state." |
| Gitignore | `.gitignore` | Terraform section | Reglas state/tfvars | "Evita subir state y variables reales." |
| README principal | `README.md` | seccion Terraform | Tabla de archivos | "El proyecto documenta IaC en la raiz." |
| Workflow | `.github/workflows/terraform.yml` | 1-37 | fmt/init/validate/plan | "Valida Terraform sin apply automatico." |

## 16. Preguntas y Respuestas Para Defensa

Pregunta 1: Que es Infrastructure as Code?
Respuesta recomendada: Es definir infraestructura en archivos versionados para poder revisarla, repetirla y automatizarla.
Archivo que debo mostrar: `infra/README.md`.
Lineas aproximadas: 1-12.
Que debo senalar: definicion de IaC.

Pregunta 2: Para que sirve Terraform?
Respuesta recomendada: Sirve para inicializar providers, planificar cambios y crear o actualizar infraestructura de forma controlada.
Archivo que debo mostrar: `infra/README.md`.
Lineas aproximadas: 14-20.
Que debo senalar: comandos `init`, `plan`, `apply`.

Pregunta 3: Que parte de tu proyecto administra Terraform?
Respuesta recomendada: Actualmente documenta y prepara hosting, base de datos, DNS, storage, logs y health checks; no crea recursos reales hasta elegir provider.
Archivo que debo mostrar: `infra/main.tf`.
Lineas aproximadas: 22-55.
Que debo senalar: `infrastructure_plan`.

Pregunta 4: Que diferencia hay entre infraestructura y despliegue de aplicacion?
Respuesta recomendada: Infraestructura son servicios cloud; despliegue es compilar y publicar la app. Terraform no reemplaza `npm build` ni el deploy runtime.
Archivo que debo mostrar: `infra/main.tf`.
Lineas aproximadas: 3-17.
Que debo senalar: comentarios iniciales.

Pregunta 5: Que diferencia hay entre configuracion y secretos?
Respuesta recomendada: Configuracion son valores no sensibles como puerto y dominio; secretos son credenciales como database URL, JWT secret o API key.
Archivo que debo mostrar: `infra/variables.tf`.
Lineas aproximadas: 1-96.
Que debo senalar: variables normales y `sensitive = true`.

Pregunta 6: Que hace `terraform init`?
Respuesta recomendada: Inicializa el directorio Terraform y descarga providers o modulos necesarios.
Archivo que debo mostrar: `infra/README.md`.
Lineas aproximadas: 38-47.
Que debo senalar: lista de comandos.

Pregunta 7: Que hace `terraform plan`?
Respuesta recomendada: Muestra los cambios que Terraform aplicaria antes de ejecutarlos.
Archivo que debo mostrar: `infra/README.md`.
Lineas aproximadas: 49-55.
Que debo senalar: comando de revision previa.

Pregunta 8: Que hace `terraform apply`?
Respuesta recomendada: Aplica cambios y crea o actualiza infraestructura.
Archivo que debo mostrar: `infra/README.md`.
Lineas aproximadas: 57-63.
Que debo senalar: advertencia de revisar plan antes.

Pregunta 9: Que hace `terraform destroy`?
Respuesta recomendada: Destruye recursos administrados por Terraform y debe usarse con cuidado.
Archivo que debo mostrar: `infra/README.md`.
Lineas aproximadas: 65-71.
Que debo senalar: comando destroy.

Pregunta 10: Que es Terraform state?
Respuesta recomendada: Es el archivo que guarda el estado de recursos administrados y puede contener datos sensibles.
Archivo que debo mostrar: `infra/README.md`.
Lineas aproximadas: 73-81.
Que debo senalar: por que no se sube.

Pregunta 11: Por que no se debe subir `terraform.tfstate`?
Respuesta recomendada: Porque puede contener informacion interna o sensible de infraestructura.
Archivo que debo mostrar: `.gitignore`.
Lineas aproximadas: seccion Terraform.
Que debo senalar: reglas `*.tfstate` y `.terraform/`.

Pregunta 12: Que variables usa tu infraestructura?
Respuesta recomendada: Usa `project_name`, `environment`, `region`, `app_name`, `domain_name`, `image_tag`, `app_port`, `database_name` y `allowed_origins`.
Archivo que debo mostrar: `infra/variables.tf`.
Lineas aproximadas: 1-76.
Que debo senalar: variables reutilizables.

Pregunta 13: Donde deberian configurarse los secretos?
Respuesta recomendada: En secrets de GitHub Actions, secret manager cloud, variables protegidas de hosting o `terraform.tfvars` local ignorado.
Archivo que debo mostrar: `infra/README.md`.
Lineas aproximadas: 83-97.
Que debo senalar: lista de lugares seguros.

Pregunta 14: Que archivos Terraform agregaste?
Respuesta recomendada: `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf` y `terraform.tfvars.example`.
Archivo que debo mostrar: `infra/`.
Lineas aproximadas: todo.
Que debo senalar: estructura de carpeta.

Pregunta 15: Que recursos se podrian reproducir con Terraform?
Respuesta recomendada: Hosting, base de datos administrada, contenedores, DNS, storage, logs y health checks.
Archivo que debo mostrar: `infra/main.tf`.
Lineas aproximadas: 40-55.
Que debo senalar: `infrastructure_plan`.

Pregunta 16: Que parte todavia se hace fuera de Terraform?
Respuesta recomendada: Build, publicacion de app, migraciones, variables runtime y smoke test post-deploy.
Archivo que debo mostrar: `infra/README.md`.
Lineas aproximadas: 99-108.
Que debo senalar: seccion "Que no reemplaza Terraform".

Pregunta 17: Como revisarias un cambio antes de aplicarlo?
Respuesta recomendada: Ejecutaria `terraform plan` y revisaria los recursos que se crean, actualizan o destruyen.
Archivo que debo mostrar: `infra/README.md`.
Lineas aproximadas: 49-55.
Que debo senalar: plan antes de apply.

Pregunta 18: Que riesgos hay al hardcodear valores?
Respuesta recomendada: Se pueden exponer secretos, dificultar cambios por entorno y hacer que el despliegue no sea portable.
Archivo que debo mostrar: `infra/variables.tf`.
Lineas aproximadas: 1-96.
Que debo senalar: variables y sensibilidad.

Pregunta 19: Que mejoraria si tuviera mas tiempo?
Respuesta recomendada: Elegiria un provider real, agregaria recursos cloud concretos, backend remoto para state y aprobaciones por environment.
Archivo que debo mostrar: `infra/versions.tf`.
Lineas aproximadas: 1-23.
Que debo senalar: providers comentados.

Pregunta 20: Por que esto ayuda a un flujo profesional?
Respuesta recomendada: Porque permite revisar infraestructura en pull requests, proteger secretos, evitar cambios manuales no documentados y repetir entornos.
Archivo que debo mostrar: `.github/workflows/terraform.yml`.
Lineas aproximadas: 1-37.
Que debo senalar: validacion en CI sin apply automatico.

## 17. Comandos Para Mostrar

Comando:

```bash
cd infra && terraform fmt -check -recursive
```

Para que sirve: valida formato Terraform.

Comando:

```bash
cd infra && terraform init
```

Para que sirve: inicializa Terraform.

Comando:

```bash
cd infra && terraform validate
```

Para que sirve: valida sintaxis y configuracion.

Comando:

```bash
cd infra && terraform plan
```

Para que sirve: revisa cambios antes de aplicar.

## 18. Resultado Final

Estado: cumple como implementacion base segura y defendible de Terraform IaC.

Validaciones ejecutadas:

| Comando | Resultado |
|---|---|
| `docker run --rm -v /Users/mayuminina/ClinicPRO:/workspace -w /workspace/infra hashicorp/terraform:1.6.6 fmt -check -recursive` | Paso |
| `docker run --rm -v /Users/mayuminina/ClinicPRO:/workspace -w /workspace/infra hashicorp/terraform:1.6.6 init -backend=false` | Paso |
| `docker run --rm -v /Users/mayuminina/ClinicPRO:/workspace -w /workspace/infra hashicorp/terraform:1.6.6 validate` | Paso |
| `docker run --rm -v /Users/mayuminina/ClinicPRO:/workspace -w /workspace/infra hashicorp/terraform:1.6.6 plan -input=false` | Paso; solo muestra outputs, no crea infraestructura real |

Parte preparada pero pendiente de proveedor real:

- Elegir provider cloud definitivo.
- Configurar credenciales fuera del repositorio.
- Reemplazar locals educativos por recursos reales.
- Configurar backend remoto para state si se trabaja en equipo.
- Ejecutar `terraform apply` solo con aprobacion.
