#!/bin/bash

# Update packages

apt-get update -y

# Install dependencies and jq

apt-get install -y curl unzip jq

# -----------------------------

# Install AWS CLI v2

# -----------------------------

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip awscliv2.zip
./aws/install

# -----------------------------

# Install kubectl

# EKS version 1.35

# -----------------------------

curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.35.6/2026-07-05/bin/linux/amd64/kubectl

chmod +x kubectl

mv kubectl /usr/local/bin/

# -----------------------------

# Install eksctl

# -----------------------------

ARCH=amd64

curl -sL 
"https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_Linux_${ARCH}.tar.gz" 
| tar xz -C /tmp

mv /tmp/eksctl /usr/local/bin/

# -----------------------------

# Verify installations

# -----------------------------

aws --version
kubectl version --client
eksctl version
jq --version
