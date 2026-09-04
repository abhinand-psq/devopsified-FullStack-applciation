env                   = "dev"
aws-region            = "ap-south-1"
vpc-cidr-block        = "10.16.0.0/16"
vpc-name              = "vpc"
igw-name              = "igw"
pub-subnet-count      = 3
pub-cidr-block        = ["10.16.0.0/20", "10.16.16.0/20", "10.16.32.0/20"]
pub-availability-zone = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
pub-sub-name          = "subnet-public"
pri-subnet-count      = 3
pri-cidr-block        = ["10.16.128.0/20", "10.16.144.0/20", "10.16.160.0/20"]
pri-availability-zone = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]
pri-sub-name          = "subnet-private"
public-rt-name        = "public-route-table"
private-rt-name       = "private-route-table"
eip-name              = "elasticip-ngw"
ngw-name              = "ngw"
eks-sg                = "eks-sg"

# EKS
is-eks-cluster-enabled     = true
cluster-version            = "1.35"
cluster-name               = "eks-cluster"
endpoint-private-access    = true
endpoint-public-access     = false
ondemand_instance_types    = ["t3.small"]
spot_instance_types        = ["t3.small"]
desired_capacity_on_demand = "1"
min_capacity_on_demand     = "1"
max_capacity_on_demand     = "4"
desired_capacity_spot      = "1"
min_capacity_spot          = "1"
max_capacity_spot          = "10"
addons = [
  {
    name    = "vpc-cni",
    version = "v1.22.4-eksbuild.3"
  },
  {
    name    = "coredns"
    version = "v1.13.2-eksbuild.11"
  },
  {
    name    = "kube-proxy"
    version = "v1.35.3-eksbuild.18"
  },  # Add more addons as needed
]

addons = [
  {
    name    = "vpc-cni",
    version = "v1.22.4-eksbuild.3"
  },
  {
    name    = "coredns"
    version = "v1.13.2-eksbuild.11"
  },
  {
    name    = "kube-proxy"
    version = "v1.35.3-eksbuild.18"
  },
  {
    name    = "aws-ebs-csi-driver"
    version = "v1.64.0-eksbuild.1"
  }
  # Add more addons as needed
]
