data "aws_ami" "ami" {
  most_recent = true

  filter {
  name   = "name"
  values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
}

  owners = ["503026942664"]
}