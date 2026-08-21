terraform {
  required_version = ">= 1.14.0, < 1.15.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.55.0"
    }
  }
  backend "s3" {
    bucket         = "dev-aman-tf-bucket"
    region         = "us-east-1"
    key            = "devopsified-FullStack-applciation/eks-setup/eks-build/terraform.tfstate"
    encrypt        = true
    use_lockfile         = true
  }
}

provider "aws" {
  region = var.aws-region
}
