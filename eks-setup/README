# 🚀 Amazon EKS Infrastructure Provisioning with Terraform

## 📖 Overview

This repository contains the Terraform configuration used to provision a production-style Amazon Elastic Kubernetes Service (EKS) cluster on AWS.

The infrastructure was built entirely using Infrastructure as Code (IaC) principles and serves as the Kubernetes platform for deploying and operating a full-stack MERN application using GitOps, CI/CD, and observability tools.

The deployment includes networking, IAM, EKS control plane, managed node groups, cluster add-ons, and remote Terraform state management.

---

## 🎯 Project Objectives

- Provision AWS infrastructure using Terraform
- Build a highly available EKS cluster across multiple Availability Zones
- Implement Infrastructure as Code (IaC) best practices
- Use remote Terraform state storage
- Configure managed worker nodes
- Enable Kubernetes workload deployment
- Prepare infrastructure for GitOps with ArgoCD
- Prepare infrastructure for monitoring using Prometheus and Grafana

---

# 🏗 Architecture

```text
                                Internet
                                    │
                                    ▼
                         ┌──────────────────┐
                         │ Internet Gateway │
                         └──────────────────┘
                                    │
                                    ▼
                  ┌──────────────────────────────────┐
                  │            AWS VPC              │
                  │         10.16.0.0/16           │
                  └──────────────────────────────────┘
                         │                     │
                         ▼                     ▼

              ┌────────────────┐     ┌────────────────┐
              │ Public Subnets │     │ Private Subnets│
              └────────────────┘     └────────────────┘
                       │                      │
                       ▼                      ▼

                ┌────────────┐       ┌───────────────┐
                │ NAT Gateway│──────▶│ EKS Cluster   │
                └────────────┘       └───────────────┘
                                            │
                         ┌──────────────────┴──────────────────┐
                         ▼                                     ▼

               On-Demand Node Group                 Spot Node Group
               (c7i-flex.large)                     (t3.small)

                         │
                         ▼

                  Kubernetes Workloads
                         │
                         ▼

             ArgoCD • Prometheus • Grafana
```

---

# ☁️ Infrastructure Components

## Networking

| Resource | Description |
|-----------|------------|
| VPC | Custom VPC |
| Internet Gateway | Public internet access |
| NAT Gateway | Outbound internet for private subnets |
| Public Route Tables | Routing for public subnets |
| Private Route Tables | Routing for private subnets |
| Public Subnets | Internet-facing resources |
| Private Subnets | Kubernetes worker nodes |

---

## VPC Configuration

### VPC CIDR

```text
10.16.0.0/16
```

### Public Subnets

```text
10.16.0.0/20
10.16.16.0/20
10.16.32.0/20
```

### Private Subnets

```text
10.16.128.0/20
10.16.144.0/20
10.16.160.0/20
```

### Availability Zones

```text
ap-south-1a
ap-south-1b
ap-south-1c
```

---

# ☸️ EKS Cluster Configuration

## Cluster Information

| Property | Value |
|-----------|---------|
| Cluster Name | dev-ap-medium-eks-cluster |
| Provider | Amazon EKS |
| Kubernetes Version | 1.35 |
| Platform Version | eks.21 |
| Region | ap-south-1 |
| Endpoint Access | Private Only |

---

## Security Configuration

The Kubernetes API Server is configured as:

```hcl
endpoint_private_access = true
endpoint_public_access  = false
```

### Benefits

- No public Kubernetes API exposure
- Improved cluster security
- Reduced attack surface
- Production-oriented design

---

# 👷 Managed Node Groups

Two separate node groups were created.

---

## On-Demand Node Group

### Configuration

```hcl
instance_types = ["c7i-flex.large"]
capacity_type  = "ON_DEMAND"
```

### Scaling

```hcl
desired_size = 1
min_size     = 1
max_size     = 4
```

### Purpose

- Critical workloads
- Stable applications
- Production services

---

## Spot Node Group

### Configuration

```hcl
instance_types = ["t3.small"]
capacity_type  = "SPOT"
```

### Scaling

```hcl
desired_size = 1
min_size     = 1
max_size     = 10
```

### Labels

```hcl
type       = "spot"
lifecycle  = "spot"
```

### Purpose

- Cost optimization
- Non-critical workloads
- Batch jobs
- Temporary workloads

---

# 🔐 IAM Configuration

## EKS Cluster Role

Attached Policies:

```text
AmazonEKSClusterPolicy
```

---

## Worker Node Role

Attached Policies:

```text
AmazonEKSWorkerNodePolicy
AmazonEKS_CNI_Policy
AmazonEC2ContainerRegistryReadOnly
```

These permissions allow worker nodes to:

- Join the cluster
- Manage pod networking
- Pull images from Amazon ECR

---

# 🔧 EKS Add-ons

The following managed add-ons were installed automatically:

| Add-on | Purpose |
|----------|----------|
| VPC CNI | Pod networking |
| CoreDNS | Cluster DNS |
| Kube Proxy | Network proxy |

---

# 🗂 Terraform Backend

Remote state storage is configured using Amazon S3.

## Benefits

- Centralized state management
- Team collaboration
- State persistence
- Improved reliability

### Backend

```hcl
backend "s3" {
    bucket = "<terraform-state-bucket>"
}
```

---

# 📁 Terraform Project Structure

```text
terraform/
│
├── backend.tf
├── provider.tf
├── variables.tf
├── outputs.tf
├── versions.tf
├── dev.tfvars
│
├── modules/
│   ├── network/
│   ├── eks/
│   └── security/
│
└── Jenkinsfile
```

---

# 🚀 Deployment Workflow

## Initialize Terraform

```bash
terraform init
```

Downloads required providers and initializes backend configuration.

---

## Validate Configuration

```bash
terraform validate
```

Checks Terraform syntax and configuration integrity.

---

## Generate Execution Plan

```bash
terraform plan -var-file=dev.tfvars
```

Preview resources before deployment.

---

## Apply Infrastructure

```bash
terraform apply -var-file=dev.tfvars
```

Creates all AWS resources.

---

## Destroy Infrastructure

```bash
terraform destroy -var-file=dev.tfvars
```

Removes all provisioned resources.

---

# 🔗 Connect to EKS Cluster

Update local kubeconfig:

```bash
aws eks update-kubeconfig \
--region ap-south-1 \
--name dev-ap-medium-eks-cluster
```

---

## Verify Cluster Access

```bash
kubectl get nodes
```

Example Output:

```text
ip-10-16-140-187.ap-south-1.compute.internal   Ready
ip-10-16-172-71.ap-south-1.compute.internal    Ready
```

---

# ✅ Validation & Verification

## Cluster Validation

Verified:

- EKS Cluster Active
- Kubernetes API reachable
- Control Plane healthy
- No cluster health issues

---

## Node Validation

Verified:

- Worker nodes joined cluster
- Nodes in Ready state
- Managed Node Groups operational

---

## Networking Validation

Verified:

- VPC connectivity
- NAT Gateway functionality
- Pod networking operational
- Internal communication successful

---

## Load Balancer Validation

Kubernetes services successfully integrated with AWS Load Balancer Controller.

Verified:

- Target Groups created automatically
- Targets registered successfully
- Health checks passing
- Traffic routing functional

---

# 📸 Deployment Evidence

## EKS Cluster Overview

Demonstrates:

- Cluster Active
- Kubernetes Version 1.35
- Cluster Health Status
- OIDC Integration

### Screenshot

```text
docs/images/eks-cluster-overview.png
```

---

## Worker Nodes

Demonstrates:

- Node registration
- Ready status
- Cluster connectivity

### Screenshot

```text
docs/images/kubectl-get-nodes.png
```

---

## AWS Target Group Health

Demonstrates:

- Successful service exposure
- Healthy Kubernetes targets
- Load balancer integration

### Screenshot

```text
docs/images/target-group-health.png
```

---

## EC2 Worker Nodes

Demonstrates:

- Managed Node Groups
- Worker node provisioning
- Instance health

### Screenshot

```text
(docs/images/worker-nodes.png)
```

---

# Post-Deployment Cluster Configuration

## Overview

After the Amazon EKS cluster was provisioned using Terraform, several Kubernetes and AWS integrations were manually configured to enable load balancing, GitOps deployments, monitoring, and application access.

These configurations extend the base EKS cluster and provide the operational capabilities required by the platform.

---

# Configuration Architecture

```text
Terraform
    |
    ▼
Amazon EKS Cluster
    |
    +-----------------------------+
    |                             |
    ▼                             ▼

AWS Load Balancer          ArgoCD
Controller                 GitOps Platform
    |                             |
    ▼                             ▼

Application Ingress     Continuous Delivery
    |
    ▼

Internet Access

    +-----------------------------+
    |
    ▼

Prometheus & Grafana
Monitoring Stack
```

---

# IAM OIDC Provider Configuration

An IAM OpenID Connect (OIDC) provider was associated with the EKS cluster.

This enables Kubernetes service accounts to assume AWS IAM roles using IAM Roles for Service Accounts (IRSA).

### Purpose

* Secure AWS API access from Kubernetes workloads
* Avoid long-lived AWS credentials
* Required for AWS Load Balancer Controller


### Verification

```bash
aws iam list-open-id-connect-providers
```

---

# AWS Load Balancer Controller

The AWS Load Balancer Controller was installed to allow Kubernetes Ingress resources to provision AWS Application Load Balancers (ALBs).

## Components Configured

### IAM Policy

```text
AWSLoadBalancerControllerIAMPolicy
```

### IAM Service Account

```text
aws-load-balancer-controller
```

### Helm Deployment

```text
Namespace: kube-system
Chart: aws-load-balancer-controller
```

### Purpose

* Provision Application Load Balancers
* Manage Target Groups
* Configure Listener Rules
* Route external traffic into Kubernetes workloads

---

## Controller Validation

Controller pods were verified after installation.

```bash
kubectl get pods -n kube-system
```

Logs were inspected to identify startup issues and validate controller operation.

---

## VPC Discovery Issue Resolution

During installation, the controller was unable to automatically discover the VPC through Instance Metadata Service (IMDS).

The deployment was updated to explicitly provide:

* AWS Region
* VPC ID

using Helm values.

This resolved controller startup failures and enabled successful ALB provisioning.

---

# Public Subnet Validation

Internet-facing Application Load Balancers require public subnets to be tagged correctly.

The EKS VPC subnets were verified to contain:

```text
kubernetes.io/role/elb = 1
```

### Purpose

Allows AWS Load Balancer Controller to automatically discover eligible public subnets for ALB creation.

---

# ArgoCD Installation

ArgoCD was installed into a dedicated namespace.

```text
Namespace: argocd
```

## Purpose

* GitOps deployment management
* Continuous synchronization
* Declarative Kubernetes deployments

### Access Method

The ArgoCD Server service was exposed using:

```text
Service Type: LoadBalancer
```

AWS automatically provisioned an external load balancer for UI access.

---

# Private Amazon ECR Integration

Container images are stored in private Amazon ECR repositories.

Kubernetes image pull secrets were configured to allow workloads to authenticate and pull images from ECR.

### Purpose

* Secure image retrieval
* Private container registry access

---

# Namespace Organization

Application workloads were deployed into dedicated namespaces instead of the default namespace.

### Benefits

* Improved visibility
* Logical workload separation
* Easier resource management
* Better monitoring organization

---

# Monitoring Stack Installation

A monitoring platform was installed using the Prometheus Community kube-prometheus-stack Helm chart.

```text
Namespace: monitoring
```

## Components Installed

* Prometheus
* Grafana
* Alertmanager
* Prometheus Operator
* kube-state-metrics
* Node Exporter

---

## Grafana Access

Grafana was exposed through a Kubernetes LoadBalancer service.

```text
Service Type: LoadBalancer
```

This provisioned an AWS Load Balancer and enabled external dashboard access.

---

## Storage Considerations

Persistent volumes were not configured for Prometheus or Grafana.

### Result

* Metrics are retained only while pods remain available.
* Suitable for learning and demonstration environments.
* Production environments should use persistent storage.

---

# Post-Deployment Summary

The following capabilities were added after cluster creation:

| Component                    | Purpose                        |
| ---------------------------- | ------------------------------ |
| IAM OIDC Provider            | IAM Roles for Service Accounts |
| AWS Load Balancer Controller | ALB Integration                |
| Public Subnet Tag Validation | Internet-facing ALBs           |
| ArgoCD                       | GitOps Deployment              |
| ECR Image Pull Secrets       | Private Registry Access        |
| Dedicated Namespaces         | Workload Isolation             |
| Prometheus                   | Metrics Collection             |
| Grafana                      | Visualization                  |
| Alertmanager                 | Alert Management               |

---

**Terraform creates EKS → Manual cluster integrations make it usable for GitOps, ingress, monitoring, and deployments.**


## 🎓 Key Learnings

During this project I gained hands-on experience with:

- Infrastructure as Code (Terraform)
- Amazon EKS & Kubernetes Administration
- VPC Networking & Multi-AZ Architecture
- IAM, OIDC & IRSA Integration
- Managed Node Groups & Spot Instances
- AWS Load Balancer Controller & Ingress
- GitOps with ArgoCD
- Amazon ECR Integration
- Prometheus & Grafana Monitoring
- Helm-based Kubernetes Deployments
- Production-style Cloud Architecture

---

## 💼 Resume Highlights

- Provisioned an Amazon EKS cluster using Terraform across multiple Availability Zones.
- Designed VPC networking with public/private subnets, NAT Gateway, route tables, and security groups.
- Configured managed node groups with On-Demand and Spot instances for cost optimization.
- Integrated AWS Load Balancer Controller for Kubernetes Ingress and ALB provisioning.
- Implemented GitOps deployment workflows using ArgoCD.
- Integrated private Amazon ECR repositories with Kubernetes workloads.
- Deployed Prometheus and Grafana for cluster monitoring and observability.
- Built a production-style Kubernetes platform ready for CI/CD, GitOps, ingress, and monitoring workloads.

---

# 👨‍💻 Author

**Abhinand P**

DevOps | Cloud | Kubernetes | Terraform | AWS

Built as part of a production-style DevOps project implementing CI/CD, GitOps, Infrastructure as Code, Monitoring, and Kubernetes operations.