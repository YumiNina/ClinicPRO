terraform {
  required_version = ">= 1.6.0"

  required_providers {
    # Add the real cloud provider when the deployment platform is finalized.
    #
    # Examples:
    #
    # aws = {
    #   source  = "hashicorp/aws"
    #   version = "~> 5.0"
    # }
    #
    # azurerm = {
    #   source  = "hashicorp/azurerm"
    #   version = "~> 3.0"
    # }
    #
    # google = {
    #   source  = "hashicorp/google"
    #   version = "~> 5.0"
    # }
  }
}
