# Post-Deployment Cluster Configuration

## Overview

After provisioning the Amazon EKS cluster using Terraform, several Kubernetes and AWS integrations were manually configured to enable ingress management, GitOps deployments, container image access, and monitoring.

These configurations transformed the base EKS cluster into a production-style Kubernetes platform capable of supporting continuous delivery and observability workflows.

---

## Configuration Architecture

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

# AWS Load Balancer Controller Integration

## Overview

The AWS Load Balancer Controller was installed to allow Kubernetes Ingress resources to automatically provision and manage AWS Application Load Balancers (ALBs).

This enables applications running inside Kubernetes to be exposed externally without manually creating load balancers in AWS.

---

## IAM OIDC Provider Configuration

An IAM OpenID Connect (OIDC) provider was associated with the EKS cluster.

This enables IAM Roles for Service Accounts (IRSA), allowing Kubernetes workloads to securely access AWS services without embedding AWS credentials inside containers.

### Purpose

- Secure AWS API access from Kubernetes workloads
- Eliminate long-lived AWS credentials
- Enable IAM Roles for Service Accounts (IRSA)
- Required for AWS Load Balancer Controller

### Configuration

```bash
eksctl utils associate-iam-oidc-provider \
  --cluster dev-ap-medium-eks-cluster \
  --region ap-south-1 \
  --approve
```

### Verification

```bash
aws iam list-open-id-connect-providers
```

---

## IAM Policy Creation

The controller requires permissions to create and manage AWS networking resources.

A dedicated IAM policy was created using the official AWS Load Balancer Controller policy document.

### Purpose

Allows the controller to manage:

- Application Load Balancers
- Target Groups
- Listener Rules
- Security Groups

### Configuration

```bash
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.14.1/docs/install/iam_policy.json

aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json
```

---

## IAM Service Account (IRSA)

A Kubernetes service account was created and linked to the IAM policy using IRSA.

### Configuration

```bash
eksctl create iamserviceaccount \
  --cluster=dev-ap-medium-eks-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=<AWSLoadBalancerControllerIAMPolicy> \
  --override-existing-serviceaccounts \
  --region ap-south-1 \
  --approve
```

### Screenshot

```text
screenshots/iam-service-account.png
```

---

## Controller Installation

The controller was installed using Helm into the `kube-system` namespace.

### Helm Repository

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
```

### Installation

```bash
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=dev-ap-medium-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

### Screenshot

```text
screenshots/aws-load-balancer-controller.png
```

---

## Controller Validation

Controller pods were verified after deployment.

```bash
kubectl get pods -n kube-system
```

Logs were inspected whenever startup issues occurred.

```bash
kubectl logs -n kube-system <controller-pod-name> --previous
```

---

## VPC Discovery Issue Resolution

During installation, the controller initially failed to start because it could not automatically discover the cluster VPC.

The issue was caused by restricted access to the EC2 Instance Metadata Service (IMDS).

To resolve this issue, the deployment was updated with explicit region and VPC information.

### Resolution

```bash
helm upgrade -i aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=dev-ap-medium-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=ap-south-1 \
  --set vpcId=<vpc-id>
```

After the update, the controller successfully started and managed AWS load balancer resources.

---

## Public Subnet Validation

Internet-facing Application Load Balancers require public subnets to be tagged correctly.

The cluster VPC subnets were validated to ensure they contained:

```text
kubernetes.io/role/elb = 1
```

### Validation Commands

```bash
VPC_ID=$(aws eks describe-cluster \
  --name dev-ap-medium-eks-cluster \
  --region ap-south-1 \
  --query 'cluster.resourcesVpcConfig.vpcId' \
  --output text)

aws ec2 describe-subnets \
  --region ap-south-1 \
  --filters "Name=vpc-id,Values=$VPC_ID"
```

### Purpose

This tag allows the AWS Load Balancer Controller to automatically discover public subnets when creating internet-facing ALBs.

---

# ArgoCD Installation

## Overview

ArgoCD was deployed to implement a GitOps-based deployment workflow.

ArgoCD continuously monitors the Kubernetes manifest repository and synchronizes cluster resources whenever changes are pushed to GitHub.

---

## Namespace Creation

```bash
kubectl create namespace argocd
```

---

## Installation

```bash
kubectl apply -n argocd \
  --server-side \
  --force-conflicts \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### Verification

```bash
kubectl get pods -n argocd
```

---

## ArgoCD UI Exposure

The ArgoCD server service was modified from ClusterIP to LoadBalancer.

### Configuration

```yaml
spec:
  type: LoadBalancer
```

This allowed external access to the ArgoCD web interface through an AWS Load Balancer.

---

## Initial Login

### Username

```text
admin
```

### Retrieve Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
-o jsonpath="{.data.password}" | base64 -d && echo
```

---

# Private Amazon ECR Integration

## Overview

Application container images are stored in private Amazon ECR repositories.

Kubernetes workloads require image pull authentication to download these images.

---

## Image Pull Secret

An image pull secret was created and referenced within deployment manifests.

### Example

```yaml
imagePullSecrets:
  - name: ecr-secret
```

### Purpose

- Authenticate against private Amazon ECR repositories
- Allow Kubernetes nodes to pull container images
- Enable ArgoCD-managed deployments to use private images

---

# Namespace Organization

## Overview

A dedicated application namespace was used for project workloads.

### Purpose

- Logical workload separation
- Improved resource visibility
- Easier monitoring and troubleshooting
- Better namespace-level metrics in Grafana

### Example Namespaces

```text
argocd
monitoring
three-tier
kube-system
```

---

# Monitoring Stack Installation

## Overview

Prometheus and Grafana were deployed using the kube-prometheus-stack Helm chart.

The monitoring stack provides visibility into cluster, node, namespace, pod, and control-plane metrics.

---

## Namespace Creation

```bash
kubectl create namespace monitoring
```

---

## Helm Repository

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

helm repo update
```

---

## Installation

```bash
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring
```

### Verification

```bash
kubectl get pods -n monitoring
```

---

## Grafana Exposure

The Grafana service was modified from ClusterIP to LoadBalancer.

### Configuration

```yaml
spec:
  type: LoadBalancer
```

This allowed external access to Grafana dashboards through an AWS Load Balancer.

---

## Grafana Login

### Retrieve Admin Password

```bash
kubectl get secret -n monitoring monitoring-grafana \
-o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

---

## Storage Considerations

Persistent storage was not configured for Prometheus or Grafana.

The kube-prometheus-stack chart was deployed using default settings without Persistent Volume Claims (PVCs).

As a result:

- Metrics are not retained after pod recreation
- Grafana dashboards are not persisted
- Suitable for learning, testing, and demonstration environments

---

# Result

After completing all post-deployment configurations:

- AWS Application Load Balancers could be provisioned through Kubernetes Ingress resources.
- ArgoCD enabled GitOps-based continuous deployment.
- Private Amazon ECR repositories were integrated with Kubernetes workloads.
- Prometheus and Grafana provided monitoring and observability capabilities.
- Namespace organization improved cluster visibility and workload management.
- The EKS platform was fully prepared for CI/CD, GitOps, ingress management, and monitoring workflows.