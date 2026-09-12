# Jenkins Server Infrastructure

## Overview

The Jenkins Server serves as the central automation platform for both **Infrastructure as Code (IaC)** and **Application CI/CD** workflows within this project.

It is responsible for provisioning AWS infrastructure using Terraform, creating and managing the Amazon EKS cluster, executing frontend and backend CI pipelines, performing security and quality validation, building container images, and supporting GitOps-based deployments.

The server hosts Jenkins and supporting DevOps tooling required across the entire software delivery lifecycle.

---

## Architecture

![Jenkins Architecture](../architecture/architecture.png)

### Core Responsibilities

### Infrastructure Automation

- Provision AWS infrastructure using Terraform
- Create and manage Amazon EKS clusters
- Configure networking resources
- Manage EKS node groups
- Execute infrastructure deployment pipelines

### Application CI/CD

- Source code checkout
- Dependency installation
- Code quality analysis
- Security vulnerability scanning
- Docker image build and validation
- Amazon ECR image publishing
- GitOps manifest updates

### Deployment Automation

- Update Kubernetes manifests
- Commit deployment changes to GitHub
- Trigger GitOps synchronization through ArgoCD
- Deliver applications to Amazon EKS

---

# Infrastructure Specifications

## Jenkins EC2 Instance

| Configuration | Value |
|-------------|---------|
| Service | Amazon EC2 |
| Purpose | Jenkins Automation Server |
| Operating System | Ubuntu Linux |
| Instance Type | c7i-flex.large |
| Region | ap-south-1 |
| Hosted Services | Jenkins, SonarQube, Docker |

### EC2 Instance

![EC2 Instance](screenshots/ec2-instance.png)

---

# Automated Server Bootstrap

The Jenkins server is provisioned using an EC2 User Data script that automatically installs and configures all required DevOps tools during instance launch.

This eliminates manual server setup and ensures consistent provisioning.

## Installed Components

### Core Services

- Jenkins
- Java 21
- Docker Engine
- SonarQube Community LTS

### AWS & Kubernetes Tooling

- AWS CLI
- Terraform
- kubectl
- eksctl
- Helm

### Security Tooling

- Trivy
- OWASP Dependency Check

---

# Jenkins Configuration

## Global Tool Configuration

The following tools are configured within Jenkins and are utilized by both infrastructure and application pipelines.

### SonarQube Scanner

Used for static code analysis and quality validation.

**Purpose**

- Code quality analysis
- Bug detection
- Security hotspot detection
- Quality Gate validation

![SonarQube Scanner](screenshots/sonar-scanner-tool.png)

---

### OWASP Dependency Check

Used to identify vulnerable dependencies and known CVEs within application packages.

**Purpose**

- Dependency vulnerability scanning
- CVE detection
- Security reporting
- NVD integration

![Dependency Check](screenshots/dependency-check-tool.png)

---

# SonarQube Integration

A dedicated SonarQube server runs inside a Docker container on the Jenkins EC2 instance and is integrated with Jenkins pipelines.

### Jenkins Configuration

```groovy
withSonarQubeEnv('sonar-server')
```

### Quality Gate Enforcement

```groovy
waitForQualityGate abortPipeline: true
```

If the configured Quality Gate fails, the pipeline automatically terminates and deployment is prevented.

### SonarQube Server Configuration

![SonarQube Server](screenshots/sonar-server.png)

---

# Credentials Management

Sensitive information is stored securely using Jenkins Credentials Manager and injected into pipelines only when required.

## Configured Credentials

| Credential | Purpose |
|------------|----------|
| aws-creds | AWS Authentication |
| github | GitHub Repository Access |
| sonar-token | SonarQube Authentication |
| nvd-api-key | OWASP Dependency Check |
| ACCOUNT_ID | AWS Account Reference |
| mohalla-frontend | Frontend Repository Access |
| mohalla-backend | Backend Repository Access |

### Credentials Configuration

![Credentials](screenshots/credentials.png)

---

# Installed Plugins

The Jenkins server utilizes multiple plugins to support infrastructure automation, CI/CD pipelines, security scanning, and AWS integrations.

## Pipeline & Build Plugins

- Pipeline
- Git Plugin
- Workspace Cleanup Plugin
- Credentials Binding Plugin

## Development Plugins

- NodeJS Plugin
- SonarQube Scanner for Jenkins

## Security Plugins

- OWASP Dependency Check Plugin

## AWS Plugins

- AWS Credentials Plugin
- Pipeline AWS Steps Plugin

## Container Plugins

- Docker
- Docker Commons
- Docker Pipeline
- Docker API
- docker-build-step

## Additional Components

- Eclipse Temurin Installer
- Trivy (Installed on Jenkins host)

---

# Infrastructure Provisioning Pipeline

A dedicated Jenkins pipeline is responsible for provisioning the Kubernetes platform using Terraform.

## Workflow

```text
GitHub
   │
   ▼
Jenkins
   │
   ▼
Terraform Init
   │
   ▼
Terraform Validate
   │
   ▼
Terraform Plan
   │
   ▼
Terraform Apply
   │
   ▼
AWS Infrastructure
   │
   ▼
Amazon EKS Cluster
```

## Resources Provisioned

### Networking

- VPC
- Public Subnets
- Private Subnets
- Internet Gateway
- NAT Gateway
- Route Tables

### Kubernetes Platform

- Amazon EKS Cluster
- EKS Managed Node Groups
- IAM Roles
- IAM Policies

### Post-Provisioning Tools

After cluster creation, the Jenkins server uses:

- kubectl
- eksctl
- Helm

to interact with and manage the Kubernetes environment.

---

# Application CI/CD Pipelines

The same Jenkins server hosts and executes separate frontend and backend CI pipelines.

## Backend Pipeline

### Pipeline Flow

```text
Checkout Source
      │
      ▼
Install Dependencies
      │
      ▼
SonarQube Analysis
      │
      ▼
Quality Gate Validation
      │
      ▼
OWASP Dependency Check
      │
      ▼
Trivy Filesystem Scan
      │
      ▼
Docker Build
      │
      ▼
Trivy Image Scan
      │
      ▼
Push Image to ECR
      │
      ▼
Update Kubernetes Manifest
```

### Security Controls

#### SonarQube

- Bugs
- Vulnerabilities
- Security Hotspots
- Code Smells

#### OWASP Dependency Check

```groovy
dependencyCheck(
    odcInstallation: 'DP-Check',
    nvdCredentialsId: 'nvd-api-key'
)
```

Detects:

- Vulnerable packages
- Known CVEs
- Dependency risks

#### Trivy Filesystem Scan

```bash
trivy fs .
```

Detects:

- Vulnerabilities
- Secrets
- Misconfigurations

#### Trivy Image Scan

Validates container images before publication.

---

## Frontend Pipeline

### Pipeline Flow

```text
Checkout Source
      │
      ▼
Install Dependencies
      │
      ▼
SonarQube Analysis
      │
      ▼
Quality Gate Validation
      │
      ▼
Docker Build
      │
      ▼
Trivy Image Scan
      │
      ▼
Push Image to ECR
      │
      ▼
Update Kubernetes Manifest
```

---

# GitOps Integration

After successful validation and image publication, Jenkins automatically updates the Kubernetes deployment manifests stored in a separate Git repository.

## Process

### Step 1

Build Docker image.

### Step 2

Push image to Amazon ECR using the Jenkins build number as the image tag.

Example:

```text
frontend:25
frontend:26
frontend:27
```

### Step 3

Clone Kubernetes manifest repository.

### Step 4

Update deployment YAML image reference.

Before:

```yaml
image: <ecr-repository>:25
```

After:

```yaml
image: <ecr-repository>:26
```

### Step 5

Commit and push manifest changes.

### Step 6

ArgoCD detects repository changes and synchronizes the updated application to Amazon EKS.

## Deployment Flow

```text
Build Success
      │
      ▼
Push Image to ECR
      │
      ▼
Clone Manifest Repository
      │
      ▼
Update Deployment YAML
      │
      ▼
Git Commit
      │
      ▼
Git Push
      │
      ▼
ArgoCD Sync
      │
      ▼
Amazon EKS Deployment
```

---

# Jenkins Dashboard

The Jenkins dashboard provides centralized visibility into all infrastructure and application delivery pipelines.

### Hosted Pipelines

- EKS Terraform Provisioning Pipeline
- Backend CI Pipeline
- Frontend CI Pipeline

### Dashboard

![Jenkins Dashboard](screenshots/jenkins-dashboard.png)

---

# Results

## Infrastructure Outcomes

- Fully automated AWS infrastructure provisioning
- Automated Amazon EKS cluster creation
- Infrastructure managed through Terraform
- Kubernetes administration tooling integrated into Jenkins

## CI/CD Outcomes

- Automated frontend and backend delivery pipelines
- Integrated code quality validation
- Automated vulnerability scanning
- Docker image lifecycle automation
- Amazon ECR integration

## Deployment Outcomes

- GitOps-driven deployments
- Automated Kubernetes manifest updates
- Continuous delivery through ArgoCD
- Consistent deployments to Amazon EKS

---
