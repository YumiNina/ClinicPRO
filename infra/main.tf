# Week 15.1 - Terraform IaC
#
# This file is intentionally safe and educational. It documents the
# infrastructure ClinicPRO needs without creating real cloud resources yet.
#
# Terraform provisions infrastructure: services, databases, DNS, storage,
# networking, container registries and similar platform resources.
# Terraform does not replace application deployment logic such as running
# npm build, pushing an image or applying app-specific database seed data.
#
# Do not write secrets directly in .tf files. Sensitive values must be provided
# through a protected secrets manager, CI/CD secrets or local tfvars files that
# are ignored by Git.

locals {
  common_tags = {
    project     = var.project_name
    app         = var.app_name
    environment = var.environment
    managed_by  = "terraform"
  }

  application_runtime = {
    backend = {
      framework    = "Express + TypeScript"
      port         = var.app_port
      health_check = "/api/health"
      start        = "npm run start"
    }

    frontend = {
      framework    = "React + Vite"
      build_output = "frontend/dist"
      runtime      = "static hosting or nginx container"
    }
  }

  infrastructure_plan = {
    hosting_service = "Servicio cloud para ejecutar el backend Node.js y servir el frontend estatico."
    database        = "Supabase PostgreSQL u otra base administrada configurada con database_url como secreto."
    container       = "Registro o servicio de contenedores opcional para las imagenes Docker del backend/frontend."
    storage         = "Almacenamiento opcional para archivos o respaldos si el alcance crece."
    dns             = "Registro DNS opcional para asociar domain_name con la URL publica."
    observability   = "Logs y health checks del proveedor cloud para detectar fallos despues del despliegue."
  }

  runtime_configuration = {
    app_port        = var.app_port
    allowed_origins = var.allowed_origins
    image_tag       = var.image_tag
    domain_name     = var.domain_name
    database_name   = var.database_name
  }

  secret_configuration = {
    database_url = "Configurar como secreto. No hacer output."
    jwt_secret   = "Configurar como secreto. No hacer output."
    api_key      = "Configurar como secreto. No hacer output."
  }
}

# When a real provider is selected, replace this documentation-only plan with
# provider resources. Examples:
#
# AWS:
# - aws_ecs_cluster / aws_ecs_service for containers
# - aws_db_instance or external Supabase configuration
# - aws_cloudwatch_log_group for logs
# - aws_route53_record for DNS
#
# Azure:
# - azurerm_container_app for backend
# - azurerm_static_web_app or storage static website for frontend
# - azurerm_postgresql_flexible_server or external Supabase configuration
#
# Google Cloud:
# - google_cloud_run_service for backend/frontend containers
# - google_sql_database_instance or external Supabase configuration
# - google_cloud_run_domain_mapping for domains
