# ArgoCD GitOps Deployment

## Overview

ArgoCD was deployed in the Amazon EKS cluster to implement a GitOps-based Continuous Delivery workflow.

Instead of manually managing application changes directly within the Kubernetes cluster, the desired Kubernetes configuration is stored in a Git repository. ArgoCD continuously compares the desired state defined in Git with the actual state running in the EKS cluster.

When differences are detected, ArgoCD can synchronize the cluster to match the configuration stored in Git.

```text
Developer
    │
    │ Push Kubernetes manifest changes
    ▼
GitHub Repository
    │
    │ Desired State
    ▼
ArgoCD
    │
    │ Synchronization
    ▼
Amazon EKS Cluster
    │
    ▼
Kubernetes Application
```

---
## ArgoCD Application Status

The following screenshots demonstrate the GitOps deployment status of the frontend and backend applications managed by ArgoCD.

### Backend 

![Backend Application Healthy and Synced](../screenshots/argocd-backend-healthy-synced.png)

### Frontend

![Frontend Application Healthy and Synced](../screenshots/argocd-frontend-healthy-synced.png)

Both applications are successfully synchronized with the desired state stored in Git and report a **Healthy** status in ArgoCD, indicating that the deployed Kubernetes resources match the configuration defined in the Git repository.

---

# ArgoCD Installation

ArgoCD was installed manually in the EKS cluster from the jump/bastion server after the EKS infrastructure was provisioned.

The installation used the official ArgoCD installation manifest.

## Create Namespace

```bash
kubectl create namespace argocd
```

## Install ArgoCD

```bash
kubectl apply -n argocd \
  --server-side \
  --force-conflicts \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

The standard installation manifest deploys the ArgoCD components required for deploying and managing applications in the Kubernetes cluster.

The official installation also creates cluster-level RBAC resources, which is why the default `argocd` namespace was used as intended by the upstream manifest.

---

# Verify ArgoCD Installation

After installation, verify that all ArgoCD components are running successfully.

## Verify Pods

```bash
kubectl get pods -n argocd
```

The ArgoCD namespace contains components responsible for:

- Application synchronization
- Repository access
- API/UI access
- Redis
- GitOps management functions

## Verify Services

```bash
kubectl get svc -n argocd
```

## Verify All Resources

```bash
kubectl get all -n argocd
```

---

# ArgoCD UI Exposure

By default, the ArgoCD server is only accessible from within the Kubernetes cluster.

For this project, the ArgoCD server service was exposed externally using a Kubernetes `LoadBalancer` Service.

## Convert Service to LoadBalancer

```bash
kubectl patch svc argocd-server \
  -n argocd \
  -p '{"spec": {"type": "LoadBalancer"}}'
```

## Verify LoadBalancer Creation

```bash
kubectl get svc argocd-server -n argocd
```

AWS automatically provisions an external load balancer for Kubernetes Services of type `LoadBalancer`, enabling external access to the ArgoCD web UI.

---

# GitOps Synchronization

The primary purpose of ArgoCD in this project was to demonstrate GitOps-based application delivery.

## GitOps Workflow

```text
Git Repository
      │
      │ Kubernetes Manifests
      ▼
Desired State
      │
      ▼
ArgoCD
      │
      │ Compare
      ▼
Actual EKS Cluster State
```

ArgoCD continuously compares:

```text
Desired State (Git)
        vs
Actual Cluster State
```

When the application configuration stored in Git differs from the resources running in the Kubernetes cluster, ArgoCD identifies the difference as **configuration drift**.

---

# Auto Sync

Auto Sync enables ArgoCD to automatically synchronize Kubernetes resources whenever changes are committed to the Git repository.

Benefits include:

- Reduced manual deployment effort
- Faster delivery of application changes
- Consistent cluster configuration

---

# Auto Heal

Auto Heal detects and corrects configuration drift between the desired state stored in Git and the actual state running in the Kubernetes cluster.

Benefits include:

- Automatic recovery from unauthorized changes
- Improved environment consistency
- Reduced operational overhead

---

# GitOps Principle Demonstrated

The key GitOps principle demonstrated in this project is:

> Git represents the single source of truth for the Kubernetes application.

Any manual changes made directly to the cluster can be detected and reconciled according to the application's ArgoCD synchronization configuration.

---

# Kubernetes Resources Managed Through GitOps

The three-tier application deployment includes Kubernetes resources such as:

- Deployments
- Services
- ConfigMaps
- Secrets
- Ingress Resources

---

# Limitations

## Manual ArgoCD Installation

ArgoCD installation is currently documented as a manual post-EKS setup step.

The Terraform infrastructure pipeline does not automatically install ArgoCD.

### Possible Future Improvements

- Terraform Helm Provider
- Helm-based deployment
- Jenkins pipeline automation
- GitOps bootstrap workflow

For the scope of this portfolio project, manual installation was sufficient to demonstrate GitOps functionality.

---

## No High Availability Configuration

This project uses the standard ArgoCD installation and is intended primarily as a learning and portfolio environment.

A production-grade deployment would typically use ArgoCD High Availability (HA) mode, which runs additional replicas of critical components to improve resiliency and availability.

---

## External UI Exposure

The ArgoCD UI was exposed using a Kubernetes LoadBalancer Service for demonstration and administrative access.

A production implementation would typically require additional security controls such as:

- TLS certificates
- Custom domain configuration
- Ingress-based access
- Authentication integration (SSO/OIDC)
- Network restrictions
- Private/internal access controls

---

# Key Concepts Demonstrated

This implementation demonstrates practical knowledge of:

- GitOps
- ArgoCD
- Amazon EKS
- Kubernetes Desired State Management
- Continuous Delivery (CD)
- Auto Sync
- Auto Heal
- Kubernetes Namespaces
- Kubernetes Services
- AWS Load Balancer Integration
- Git-Based Application Configuration
- Configuration Drift Detection
- Declarative Kubernetes Deployments