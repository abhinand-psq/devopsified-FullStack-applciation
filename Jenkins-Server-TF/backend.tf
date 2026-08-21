
terraform {
  backend "s3" {
    bucket               = "my-eks-bucket-503026942664-ap-south-1-an"
    region               = "ap-south-1"
    key                  = "devopsified-FullStack-applciation/Jenkins-Server-TF/terraform.tfstate"
    use_path_style       = false
    encrypt              = true
    use_lockfile = true
  }
}


