# Infrastructure as Code - Terraform

Esta carpeta contiene la base de Infrastructure as Code de ClinicPRO para Week 15.1.

## Que es Infrastructure as Code

Infrastructure as Code permite describir infraestructura con archivos versionados. En lugar de crear servicios manualmente desde un panel cloud, se documenta y automatiza que recursos necesita la aplicacion.

## Que hace Terraform

Terraform lee archivos `.tf`, calcula cambios con `terraform plan` y puede crear, actualizar o destruir infraestructura con `terraform apply` y `terraform destroy`.

## Alcance actual

Esta implementacion es segura y educativa. No crea recursos reales porque el proyecto no tiene credenciales cloud ni proveedor Terraform real configurado. Deja preparada la estructura para completar un proveedor como AWS, Azure, Google Cloud o un proveedor compatible con la plataforma final.

Recursos que administraria o dejaria preparados:

- Servicio de hosting para backend Node.js.
- Hosting estatico para frontend React/Vite.
- Base de datos administrada o conexion externa a Supabase PostgreSQL.
- Configuracion de CORS y puerto de aplicacion.
- DNS opcional para dominio publico.
- Storage opcional.
- Logs y health checks del proveedor cloud.

## Archivos

| Archivo | Proposito |
|---|---|
| `main.tf` | Documenta el plan de infraestructura y separa infraestructura, runtime y secretos. |
| `variables.tf` | Define variables reutilizables para evitar hardcoding. |
| `outputs.tf` | Expone salidas utiles para defensa sin mostrar secretos. |
| `versions.tf` | Define version minima de Terraform y deja preparada la seccion de providers. |
| `terraform.tfvars.example` | Ejemplo seguro de variables sin credenciales reales. |

## Comandos

Ejecutar desde esta carpeta:

```bash
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
terraform destroy
```

Comando para revisar cambios antes de aplicar:

```bash
terraform plan
```

Comando que aplica cambios:

```bash
terraform apply
```

Comando para destruir recursos administrados:

```bash
terraform destroy
```

## Terraform state

Terraform state es el archivo donde Terraform guarda el estado de los recursos que administra. Puede contener IDs, atributos y, dependiendo del provider, datos sensibles.

No se debe subir `terraform.tfstate`, `terraform.tfstate.backup`, `.terraform/` ni `terraform.tfvars` al repositorio.

## Secretos

Los secretos deben configurarse fuera de Git:

- Secrets de GitHub Actions.
- Secret manager del proveedor cloud.
- Variables protegidas de la plataforma de hosting.
- Un archivo local `terraform.tfvars` ignorado por Git.

No escribir valores reales de `DATABASE_URL`, JWT secrets, API keys, tokens ni private keys en archivos versionados.

## Que no reemplaza Terraform

Terraform no reemplaza el deploy de aplicacion. La aplicacion todavia necesita:

- Build de frontend y backend.
- Publicacion de imagen o archivos estaticos.
- Variables de runtime.
- Migraciones o scripts de base de datos cuando correspondan.
- Smoke test posterior al deploy.

## Que falta para usarlo con cloud real

1. Elegir provider Terraform real.
2. Agregar el bloque de provider en `versions.tf`.
3. Configurar credenciales seguras fuera del repositorio.
4. Reemplazar los `locals` educativos de `main.tf` por recursos reales.
5. Ejecutar `terraform plan`.
6. Revisar el plan antes de aplicar.
7. Ejecutar `terraform apply` solo cuando se apruebe el cambio.
