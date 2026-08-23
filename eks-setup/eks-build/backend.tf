terraform {
  required_version = ">= 1.14.0, < 1.15.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.55.0"
    }
    random = {
  source  = "hashicorp/random"
  version = "~> 3.7.0"
}
  }
  
  backend "s3" {
    bucket         = "my-eks-bucket-503026942664-ap-south-1-an"
    region         = "us-east-1"
    key            = "eks-setup/eks-build/terraform.tfstate"
    encrypt        = true
    use_lockfile         = true
  }
}

provider "aws" {
  region = var.aws-region
}
