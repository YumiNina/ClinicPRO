output "project_name" {
  description = "Nombre del proyecto configurado para infraestructura."
  value       = var.project_name
}

output "environment" {
  description = "Entorno configurado."
  value       = var.environment
}

output "app_name" {
  description = "Nombre de la aplicacion."
  value       = var.app_name
}

output "app_port" {
  description = "Puerto esperado por la aplicacion backend."
  value       = var.app_port
}

output "allowed_origins" {
  description = "Origenes permitidos para CORS."
  value       = var.allowed_origins
}

output "domain_name" {
  description = "Dominio publico configurado si existe."
  value       = var.domain_name
}

output "infrastructure_plan" {
  description = "Resumen de recursos que Terraform administraria cuando se configure el proveedor real."
  value       = local.infrastructure_plan
}

output "application_runtime" {
  description = "Resumen de runtime esperado para frontend y backend."
  value       = local.application_runtime
}
