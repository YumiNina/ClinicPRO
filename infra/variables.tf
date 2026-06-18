variable "project_name" {
  description = "Nombre del proyecto."
  type        = string
  default     = "clinicpro"
}

variable "environment" {
  description = "Entorno de despliegue, por ejemplo dev, staging o production."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "environment debe ser dev, staging o production."
  }
}

variable "region" {
  description = "Region cloud donde se provisionaria la infraestructura."
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Nombre de la aplicacion o servicio principal."
  type        = string
  default     = "clinicpro"
}

variable "domain_name" {
  description = "Dominio publico opcional para la aplicacion."
  type        = string
  default     = ""
}

variable "image_tag" {
  description = "Tag de imagen de contenedor que se desplegaria en el servicio cloud."
  type        = string
  default     = "latest"
}

variable "app_port" {
  description = "Puerto esperado por el backend de la aplicacion."
  type        = number
  default     = 3001

  validation {
    condition     = var.app_port > 0 && var.app_port <= 65535
    error_message = "app_port debe estar entre 1 y 65535."
  }
}

variable "database_name" {
  description = "Nombre logico de la base de datos administrada o externa."
  type        = string
  default     = "clinicpro"
}

variable "allowed_origins" {
  description = "Lista de origenes permitidos para CORS."
  type        = list(string)
  default     = ["http://localhost:5174"]
}

variable "database_url" {
  description = "URL de conexion a la base de datos. Debe configurarse como secreto, no subirse al repositorio."
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_secret" {
  description = "Secreto JWT de ejemplo para IaC. En la app real usar JWT_ACCESS_SECRET y JWT_REFRESH_SECRET como secretos separados."
  type        = string
  sensitive   = true
  default     = ""
}

variable "api_key" {
  description = "API key o token de proveedor externo. Debe configurarse como secreto."
  type        = string
  sensitive   = true
  default     = ""
}
