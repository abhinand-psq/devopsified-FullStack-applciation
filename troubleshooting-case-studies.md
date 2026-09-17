# DevOps Troubleshooting & Incident Case Studies

## Overview

Building and operating the DevOps platform involved significantly more than provisioning infrastructure and deploying applications.

During the project, I encountered and investigated real issues across:

* AWS
* Amazon EKS
* Kubernetes
* Terraform
* IAM
* IRSA
* AWS Load Balancer Controller
* Jenkins
* Docker
* Helm
* Networking
* Ingress
* Infrastructure lifecycle management

The troubleshooting approach followed throughout the project was:

```text
Observe Issue
      ↓
Identify Failing Layer
      ↓
Collect Evidence
      ↓
Investigate Root Cause
      ↓
Apply Fix
      ↓
Validate Resolution
      ↓
Document Lessons Learned
```

The objective was not simply to make the platform work, but to understand **why a component failed, which layer was responsible, how the failure was isolated, and what architectural lesson could be taken from it.**

---

# 1. Amazon EBS CSI Add-on Stuck in `CREATING`

## Objective

The initial architecture considered using Kubernetes Persistent Volumes backed by Amazon EBS for stateful workloads.

```text
Application
      ↓
Amazon EKS
      ↓
EBS CSI Driver
      ↓
Amazon EBS
      ↓
Persistent Volume
```

The EBS CSI driver is the Kubernetes CSI integration used to manage Amazon EBS-backed storage. AWS documents that the driver requires AWS IAM permissions to make the required AWS API calls.

---

## Problem

During Terraform deployment, the EBS CSI EKS add-on remained in:

```text
CREATING
```

Terraform eventually failed after waiting for the add-on to become `ACTIVE`:

```text
Error: waiting for EKS Add-On
(dev-ap-medium-eks-cluster:aws-ebs-csi-driver)
create: timeout while waiting for state to become
'ACTIVE'

last state: 'CREATING'

timeout: 20m0s
```

Terraform also displayed:

```text
Warning:
Running terraform apply again will remove the kubernetes
add-on and attempt to create it again effectively purging
previous add-on configuration
```

---

## Investigation

First, the EKS add-on status was checked directly through AWS:

```bash
aws eks describe-addon \
  --cluster-name dev-ap-medium-eks-cluster \
  --addon-name aws-ebs-csi-driver \
  --region ap-south-1
```

The result showed:

```json
{
    "addonName": "aws-ebs-csi-driver",
    "clusterName": "dev-ap-medium-eks-cluster",
    "status": "CREATING",
    "addonVersion": "v1.64.0-eksbuild.1",
    "health": {
        "issues": []
    },
    "namespaceConfig": {
        "namespace": "kube-system"
    }
}
```

The Kubernetes system pods were then inspected:

```bash
kubectl get pods -n kube-system
```

The important observation was:

```text
aws-node-*                         Running
coredns-*                          Running
kube-proxy-*                       Running

ebs-csi-node-*                     Running

ebs-csi-controller-*               CrashLoopBackOff
```

More specifically:

```text
ebs-csi-controller-599f8cb6cf-qlkwq   1/6   CrashLoopBackOff
ebs-csi-controller-599f8cb6cf-rsnhn   1/6   CrashLoopBackOff
```

The controller pods were repeatedly restarting:

```text
75+ restarts
```

while the EBS CSI node pods were healthy:

```text
ebs-csi-node-*    3/3 Running
```

---

## Cluster Health Verification

The worker nodes were checked:

```bash
kubectl get nodes
```

Result:

```text
ip-10-16-139-197.ap-south-1.compute.internal   Ready
ip-10-16-156-175.ap-south-1.compute.internal   Ready
```

This established that:

```text
EKS Control Plane
       ↓
Worker Nodes
       ↓
Kubernetes Networking
       ↓
CoreDNS
       ↓
kube-proxy
```

were generally functioning.

The failure was therefore narrowed to the **EBS CSI controller/add-on layer**, rather than a general EKS worker-node failure.

---

## IAM Investigation

The investigation then focused on AWS authentication and IAM permissions required by the EBS CSI controller.

The relevant architecture was:

```text
EBS CSI Controller
        ↓
Kubernetes Service Account
        ↓
IAM Role
        ↓
IAM Policy
        ↓
AWS APIs
```

AWS documentation confirms that the EBS CSI driver requires IAM permissions for AWS API operations and supports IAM-based authentication mechanisms such as IRSA.

A dedicated Kubernetes Service Account / IAM Role association was therefore investigated using `eksctl`.

Example approach:

```bash
eksctl create iamserviceaccount \
  --name ebs-csi-controller-sa \
  --namespace kube-system \
  --cluster dev-ap-medium-eks-cluster \
  --role-name AmazonEKS_EBS_CSI_DriverRole \
  --role-only \
  --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicyV2 \
  --approve
```

---

## Architectural Decision

Although the EBS CSI issue was investigated, the final application architecture changed.

The project did not require persistent EBS-backed storage for the final application design.

Instead of:

```text
EKS
 ↓
EBS
 ↓
Persistent Database
```

the architecture moved toward:

```text
EKS
 ↓
Application
 ↓
MongoDB Atlas
```

Therefore, EBS-backed persistence was no longer required by the final application architecture.

The EBS CSI driver was consequently removed from the final design.

---

## Key Lesson

Not every infrastructure problem needs to be solved by forcing the original design to work.

Troubleshooting can reveal that a component is unnecessary for the final architecture.

The important engineering decision was:

```text
Investigate
    ↓
Understand Dependency
    ↓
Evaluate Actual Requirement
    ↓
Remove Unnecessary Complexity
```

---

# 2. AWS Load Balancer Controller Initialization Failure

## Objective

Deploy the AWS Load Balancer Controller so Kubernetes Ingress resources could provision AWS Application Load Balancers.

Expected architecture:

```text
Internet
    ↓
AWS Application Load Balancer
    ↓
AWS Load Balancer Controller
    ↓
Kubernetes Ingress
    ↓
Kubernetes Service
    ↓
Pods
```

AWS documents the AWS Load Balancer Controller as the Kubernetes controller used to manage AWS load-balancing resources and supports configuring it through Helm and `eksctl`.

---

## Initial Setup

The environment included:

* EKS cluster
* IAM OIDC provider
* IAM policy
* IAM role
* IRSA
* Kubernetes Service Account
* AWS Load Balancer Controller
* Kubernetes Ingress

The intended identity chain was:

```text
Ingress
    ↓
AWS Load Balancer Controller
    ↓
Kubernetes Service Account
    ↓
IAM Role
    ↓
AWS APIs
```

---

## Problem

The AWS Load Balancer Controller pods failed during initialization.

Controller logs showed errors related to VPC discovery:

```text
failed to get VPC ID

failed to fetch VPC ID from instance metadata

context deadline exceeded
```

---

## Investigation

Controller logs were inspected:

```bash
kubectl logs \
  aws-load-balancer-controller-xxxx \
  -n kube-system
```

The investigation initially considered IAM because the controller needs AWS API permissions.

However, the logs pointed toward **environment discovery** rather than a straightforward IAM authorization failure.

The controller was attempting to discover information through EC2 metadata.

The observed sequence was:

```text
Controller Startup
        ↓
VPC Discovery
        ↓
EC2 Metadata Request
        ↓
Metadata Request Timeout
        ↓
Controller Initialization Failure
```

---

## Root Cause

The problem was related to automatic VPC/environment discovery through instance metadata.

The controller could not successfully discover the required VPC information in the environment.

---

## Resolution

The Helm deployment was updated to explicitly provide the AWS Region and VPC ID:

```bash
helm upgrade -i aws-load-balancer-controller \
  eks/aws-load-balancer-controller \
  --set region=ap-south-1 \
  --set vpcId=<vpc-id>
```

This changed the discovery model from:

```text
Controller
    ↓
Automatic Metadata Discovery
```

to:

```text
Controller
    ↓
Explicit Region
+
Explicit VPC ID
```

AWS documentation specifically recommends supplying `region` and `vpcId` when deploying the controller in environments where access to EC2 instance metadata is restricted.

---

## Verification

The controller deployment was checked:

```bash
kubectl get deployment \
  -n kube-system \
  aws-load-balancer-controller
```

Expected healthy state:

```text
READY 2/2
```

The controller subsequently became healthy and ALB provisioning worked.

---

## Key Lesson

IAM problems and environment-discovery problems can look similar.

The investigation demonstrated the importance of reading the actual controller logs before changing permissions.

```text
Controller Failure
      ↓
Read Logs
      ↓
Identify Exact Dependency
      ↓
Determine IAM vs Discovery vs Networking
      ↓
Apply Targeted Fix
```

---

# 3. Terraform VPC Destroy `DependencyViolation`

## Problem

Terraform destroy initially failed while deleting the VPC.

AWS returned:

```text
DependencyViolation:
VPC has dependencies
```

Terraform was therefore unable to delete the parent VPC resource.

---

## Investigation

The VPC and its dependent AWS resources were inspected using AWS CLI commands.

Examples included:

```bash
aws ec2 describe-network-interfaces
```

```bash
aws ec2 describe-route-tables \
  --filters Name=vpc-id,<vpc-id>
```

Transit Gateway attachments were also checked:

```bash
aws ec2 describe-transit-gateway-vpc-attachments \
  --region ap-south-1
```

The result showed:

```json
{
    "TransitGatewayVpcAttachments": []
}
```

The investigation continued by checking VPC-associated resources and dependencies.

---

## Root Cause

AWS prevents deletion of a VPC while dependent resources still exist.

The dependency relationship was effectively:

```text
VPC
 ├── Subnets
 ├── Route Tables
 ├── Internet Gateway
 ├── Network Interfaces
 ├── Security Groups
 └── Other AWS-managed dependencies
```

A parent resource cannot be removed until its required child/dependent resources are gone.

---

## Resolution

Resources were removed in dependency order.

The general dependency sequence was:

```text
Dependent Resources
        ↓
Network Interfaces
        ↓
Subnets
        ↓
Internet Gateway
        ↓
VPC
```

Terraform eventually progressed after the blocking dependencies were removed.

---

## Key Lesson

Infrastructure deletion is also a dependency-management problem.

A Terraform resource being marked for destruction does not necessarily mean AWS can immediately delete it.

When a VPC reports:

```text
DependencyViolation
```

the correct response is to identify the remaining AWS resources attached to that VPC rather than repeatedly retrying the same deletion.

---

# 4. Terraform Existing IAM Role Conflict

## Problem

Terraform apply failed while attempting to create an IAM Role because the role already existed in AWS.

The AWS API returned:

```text
EntityAlreadyExists
```

---

## Investigation

The IAM role was verified in AWS.

The important state was:

```text
AWS:
IAM Role exists

Terraform:
IAM Role not present in state
```

This produced a resource ownership mismatch.

---

## Root Cause

Terraform state and actual AWS infrastructure were not synchronized.

The situation was:

```text
AWS Infrastructure
        ↓
IAM Role Exists
        ↓
Terraform State
        ↓
Resource Missing
```

Terraform therefore attempted to create something AWS already had.

---

## Resolution

The existing AWS resource was imported into Terraform state:

```bash
terraform import
```

After importing the resource, Terraform configuration and state were validated:

```bash
terraform plan
```

The infrastructure could then be managed by Terraform without attempting to recreate the existing IAM Role.

---

## Key Lesson

Terraform state and cloud infrastructure are separate systems.

When Terraform reports that a resource already exists, deleting the resource is not always the correct solution.

The correct question is:

```text
Does the resource already exist
because it should be managed by Terraform?
```

If yes, importing it into Terraform state is often the appropriate solution.

---

# 5. Development Ingress Validation Before AWS ALB

## Objective

Validate Kubernetes application routing before introducing AWS-specific load-balancing infrastructure.

The application consisted of frontend and backend components.

---

## Development Architecture

```text
Browser
    ↓
abhi.app.local
    ↓
NGINX Ingress Controller
       ↓
 ┌───────────────┐
 │               │
 ▼               ▼
Frontend       Backend
Service        Service
 │               │
 ▼               ▼
Pods           Pods
```

---

## Components

The development environment included:

* Frontend Deployment
* Backend Deployment
* ClusterIP Services
* NGINX Ingress Controller
* Kubernetes Ingress
* Path-based routing

Routing:

```text
/          → Frontend
/api/v1    → Backend
```

---

## Validation

The following Kubernetes resources were inspected:

```bash
kubectl get ingress
```

```bash
kubectl get svc
```

```bash
kubectl get endpoints
```

The investigation focused on:

* Frontend accessibility
* Backend API routing
* Service-to-Pod connectivity
* Endpoint registration
* Ingress routing behavior

The frontend was also tested through the local hostname:

```text
abhi.app.local
```

The Kubernetes ingress path was therefore validated before introducing AWS ALB infrastructure.

---

## Transition to AWS

Development:

```text
Browser
    ↓
NGINX Ingress
    ↓
Kubernetes Services
    ↓
Pods
```

AWS production-style architecture:

```text
Internet
    ↓
AWS ALB
    ↓
AWS Load Balancer Controller
    ↓
Kubernetes Ingress
    ↓
Services
    ↓
Pods
```

---

## Key Lesson

Application routing can be validated separately from cloud load-balancer provisioning.

By validating Kubernetes routing first, AWS-specific troubleshooting could focus on:

* IAM
* ALB
* EKS
* AWS networking
* Controller configuration

rather than debugging application routing and AWS infrastructure simultaneously.

---

# 6. Jenkins CI Server Resource Bottleneck

## Objective

Build a centralized Jenkins automation server capable of handling:

* Terraform provisioning
* Docker image builds
* SonarQube analysis
* OWASP Dependency Check
* Trivy vulnerability scanning
* Amazon ECR image pushes
* GitOps manifest updates

---

## Problem

As additional quality and security stages were introduced, Jenkins performance became inconsistent.

Pipeline execution times increased during resource-intensive operations such as:

* Docker builds
* SonarQube analysis
* Dependency scanning
* Trivy vulnerability scanning

---

## Investigation

Resource usage was inspected directly on the Jenkins EC2 instance.

```bash
free -h
```

```bash
top
```

```bash
nproc
```

```bash
docker system df
```

Pipeline stages were reviewed to determine which operations were consuming significant CPU, memory, and disk resources.

---

## Root Cause

The original Jenkins EC2 instance was undersized for the combined CI workload.

The server was responsible for:

```text
Git Checkout
      ↓
Dependency Installation
      ↓
SonarQube Analysis
      ↓
OWASP Scan
      ↓
Trivy Scan
      ↓
Docker Build
      ↓
ECR Push
```

Multiple compute-intensive operations were therefore being executed on the same machine.

---

## Resolution

The Jenkins server was migrated to a larger EC2 instance:

```text
c7i-flex.large
```

Configured capacity:

```text
2 vCPU
4 GiB RAM
```

The larger instance provided additional capacity for the CI workload while maintaining reasonable infrastructure cost.

---

## Verification

After the change:

* Pipeline execution became more stable
* Docker builds operated consistently
* Security scans completed more reliably
* Resource pressure was reduced

---

## Key Lesson

CI infrastructure must be sized according to **pipeline workload**, not simply application size.

A relatively small application can still require significant CI resources when the pipeline includes:

```text
Code Analysis
+
Dependency Scanning
+
Security Scanning
+
Docker Builds
+
Container Registry Operations
```

---

# 7. Preserving Jenkins Configuration During EC2 Migration

## Objective

Ensure that replacing or rebuilding the Jenkins EC2 instance would not result in the loss of Jenkins configuration.

---

## Problem

Jenkins stores important operational information on the Jenkins home directory.

Important data includes:

```text
Jobs
Plugins
Credentials
Pipeline Definitions
Build History
Users
System Configuration
```

Replacing the EC2 instance without preserving this information could require rebuilding Jenkins from scratch.

---

## Investigation

The Jenkins home directory was identified as:

```text
/var/lib/jenkins
```

Important contents included:

```text
/var/lib/jenkins/jobs/
/var/lib/jenkins/plugins/
/var/lib/jenkins/users/
/var/lib/jenkins/config.xml
```

---

## Solution

A backup approach using Amazon S3 was designed.

Architecture:

```text
Jenkins EC2
      ↓
/var/lib/jenkins
      ↓
S3 Backup
      ↓
New EC2 Instance
      ↓
Restore Jenkins Home
```

This separated Jenkins configuration and operational data from the underlying compute instance.

---

## Benefits

The approach provides:

* Faster disaster recovery
* Simplified EC2 migration
* Jenkins configuration preservation
* Reduced dependency on a single EC2 instance

---

## Key Lesson

Infrastructure should be treated as replaceable.

Critical operational configuration should not exist only on the server that currently runs the application.

---

# 8. Existing Service Account / CloudFormation Conflict During IRSA Setup

## Objective

Configure IAM Roles for Service Accounts (IRSA) for the AWS Load Balancer Controller.

Expected architecture:

```text
AWS Load Balancer Controller
            ↓
Kubernetes Service Account
            ↓
IAM Role
            ↓
IAM Policy
            ↓
AWS APIs
```

AWS's current documentation continues to support IRSA, although AWS now recommends EKS Pod Identity for supported add-ons.

---

## Problem

While creating the IAM Service Account with `eksctl`, the operation encountered a conflict because resources already existed.

The AWS Load Balancer Controller Service Account had previously been created and was associated with an existing `eksctl`-managed CloudFormation stack.

Example command:

```bash
eksctl create iamserviceaccount \
  --cluster=<cluster-name> \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=<policy-arn> \
  --region ap-south-1 \
  --approve
```

---

## Investigation

Existing Kubernetes and AWS resources were inspected.

Kubernetes Service Account:

```bash
kubectl get sa \
  aws-load-balancer-controller \
  -n kube-system
```

The investigation also considered:

* Existing IAM Roles
* Existing CloudFormation stacks
* Existing Service Account configuration
* `eksctl` resource ownership

The discovered relationship was:

```text
Service Account Already Exists
           ↓
CloudFormation Stack Already Exists
           ↓
eksctl Creation Conflicts
```

---

## Root Cause

The Kubernetes Service Account and associated AWS-managed resources already existed from an earlier configuration.

`eksctl` therefore detected an existing resource instead of treating the operation as a completely new Service Account creation.

---

## Resolution

The Service Account was reconciled using:

```bash
eksctl create iamserviceaccount \
  --cluster=<cluster-name> \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=<policy-arn> \
  --override-existing-serviceaccounts \
  --region ap-south-1 \
  --approve
```

This allowed the existing Service Account configuration to be overridden/reconciled.

AWS's documented installation procedure for the AWS Load Balancer Controller also uses `--override-existing-serviceaccounts` in the `eksctl create iamserviceaccount` command.

---

## Verification

The Service Account was checked:

```bash
kubectl get sa \
  aws-load-balancer-controller \
  -n kube-system
```

The expected IAM role association was then verified.

The AWS Load Balancer Controller could subsequently use the IAM role for AWS API access.

---

## Key Lesson

When using `eksctl`, existing Kubernetes Service Accounts and CloudFormation-managed resources can create reconciliation conflicts.

Before creating a new IAM Service Account, inspect:

```text
Kubernetes Service Account
+
IAM Role
+
CloudFormation Stack
+
eksctl ownership
```

When the intention is to reconcile an existing Service Account, `--override-existing-serviceaccounts` can be used.

---

# 9. EKS Worker Node Validation

## Cluster

The EKS cluster used in the project was:

```text
dev-ap-medium-eks-cluster
```

Region:

```text
ap-south-1
```

Kubernetes version observed on the worker nodes:

```text
v1.35.7-eks-cb19647
```

---

## Worker Nodes

The cluster was configured with:

```text
2 worker nodes
```

Observed nodes:

```text
ip-10-16-139-197.ap-south-1.compute.internal
ip-10-16-156-175.ap-south-1.compute.internal
```

Both nodes reached:

```text
STATUS: Ready
```

---

## Kubernetes System Components

The healthy system components included:

```text
aws-node-*             Running
coredns-*              Running
kube-proxy-*           Running
ebs-csi-node-*         Running
```

The problematic component was:

```text
ebs-csi-controller-*   CrashLoopBackOff
```

This distinction was useful during troubleshooting because it showed that the worker nodes themselves were operational even though one EKS add-on was unhealthy.

---

# 10. Terraform and Jenkins Infrastructure Workflow

The infrastructure was provisioned through Terraform and automated using Jenkins.

High-level workflow:

```text
Developer
    ↓
Git Repository
    ↓
Jenkins
    ↓
Terraform
    ↓
AWS Infrastructure
    ↓
Amazon EKS
```

Terraform operations included:

```text
terraform init
        ↓
terraform validate
        ↓
terraform plan
        ↓
terraform apply
```

The Jenkins pipeline supported actions including:

```text
PLAN
APPLY
DESTROY
```

Terraform variable files were used to control environment-specific configuration.

Example:

```bash
terraform plan \
  -var-file=dev.tfvars
```

```bash
terraform apply \
  -auto-approve \
  -var-file=dev.tfvars
```

The project also encountered questions around the correct variable file for destroy operations, highlighting the importance of using the same environment configuration consistently when managing an environment lifecycle.

---

# 11. VPC and EKS Infrastructure

The EKS environment used a custom VPC architecture.

Relevant infrastructure included:

```text
VPC
 ├── Public Subnets
 ├── Private Subnets
 ├── Route Tables
 ├── Internet Gateway
 ├── NAT Gateway
 ├── Elastic IP
 ├── Security Groups
 └── EKS
      └── Managed Node Group
```

Example environment information:

```text
AWS Region:
ap-south-1

VPC:
dev-ap-medium-vpc

CIDR:
10.16.0.0/16

EKS Cluster:
dev-ap-medium-eks-cluster
```

A public subnet example observed during troubleshooting:

```text
dev-ap-medium-subnet-public-3

CIDR:
10.16.32.0/20

Availability Zone:
ap-south-1c
```

The subnet was configured for public IP assignment and included the load-balancer-related Kubernetes subnet tag:

```text
kubernetes.io/role/elb=1
```

---

# 12. Application Deployment and Kubernetes Architecture

The application platform was designed around a three-tier-style Kubernetes deployment.

Example namespace:

```text
three-tier
```

Backend Deployment:

```text
api
```

Configuration included:

```text
replicas: 2
```

Rolling update strategy:

```text
maxSurge: 1
maxUnavailable: 25%
```

Backend configuration included a MongoDB connection string:

```text
mongodb://mongodb-svc:27017/todo?directConnection=true
```

Sensitive MongoDB credentials were provided through a Kubernetes Secret.

---

# 13. Kubernetes Readiness and Application Health

The backend application used a readiness endpoint:

```text
/ready
```

The readiness probe is intended to indicate whether the application is ready to receive traffic.

The important operational distinction is:

```text
Container Running
        ≠
Application Ready
```

A pod can have a running container while its readiness probe is failing.

For example:

```text
Pod:
Running

Application:
Not Ready
```

Kubernetes can therefore prevent traffic from being sent to a pod until its readiness condition becomes healthy.

This distinction was investigated as part of understanding Kubernetes probes and application availability.

---

# 14. GitOps and Argo CD

The project also incorporated GitOps principles using Argo CD.

Architecture:

```text
GitHub
   ↓
GitOps Repository
   ↓
Argo CD
   ↓
Amazon EKS
```

The repository acted as the desired state.

For example:

```text
Git Repository
    ↓
4 Deployments
+
3 Services
```

If a Deployment was manually deleted from the cluster while auto-sync and self-healing were enabled, Argo CD could detect the difference between:

```text
Desired State
      vs
Live State
```

and reconcile the cluster toward the Git-defined state.

---

# 15. Monitoring and Observability

The platform also included:

```text
Prometheus
Grafana
```

The purpose of monitoring in this project was primarily to demonstrate operational observability.

The monitoring stack provided visibility into Kubernetes workloads and infrastructure behavior.

Persistent monitoring storage was not a core requirement of the project, so permanent data retention was not treated as a necessary dependency.

---

# Engineering Skills Demonstrated

The troubleshooting incidents required practical experience across multiple layers.

## AWS

* Amazon EKS
* IAM
* IAM Roles for Service Accounts
* OIDC
* EBS
* EC2
* VPC
* Subnets
* Route Tables
* Internet Gateway
* NAT Gateway
* Elastic IP
* Security Groups
* Application Load Balancer
* Amazon ECR
* S3

## Kubernetes

* Pods
* Deployments
* Services
* ClusterIP
* Ingress
* Service Accounts
* Secrets
* Readiness Probes
* Kubernetes Controllers
* CSI Drivers
* Namespaces
* Rolling Updates

## Infrastructure as Code

* Terraform
* Terraform State
* Terraform Modules
* Terraform Import
* Terraform Plan
* Terraform Apply
* Terraform Destroy
* Resource Dependencies
* Variable Files
* AWS S3 Backend

## CI/CD

* Jenkins
* Git
* Docker
* Amazon ECR
* SonarQube
* OWASP Dependency Check
* Trivy

## Kubernetes Platform Tools

* Helm
* eksctl
* kubectl
* AWS CLI
* Argo CD

## Observability

* Prometheus
* Grafana

---

# Core Troubleshooting Framework

The troubleshooting process used throughout the project can be summarized as:

```text
                 INCIDENT
                    │
                    ▼
              Observe Issue
                    │
                    ▼
          Identify Failing Layer
                    │
                    ▼
             Collect Evidence
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     CLI / Logs          Kubernetes State
          │                   │
          └─────────┬─────────┘
                    ▼
           Validate Assumptions
                    │
                    ▼
             Find Root Cause
                    │
                    ▼
              Apply Fix
                    │
                    ▼
             Verify Outcome
                    │
                    ▼
           Document the Lesson
```

---

# Engineering Lessons Learned

## 1. Read the actual error before changing configuration

A controller failure does not automatically mean an IAM problem.

Logs and resource status should determine which layer is actually failing.

---

## 2. Cloud resources have dependencies

AWS infrastructure cannot always be destroyed in arbitrary order.

Parent resources such as VPCs depend on child resources being removed first.

---

## 3. Terraform state matters

Terraform does not automatically know about every resource that exists in AWS.

If infrastructure was created outside Terraform, state may need to be reconciled using import.

---

## 4. Kubernetes components have different responsibilities

A healthy node does not guarantee that every cluster add-on is healthy.

For example:

```text
Worker Node       → Ready
EBS CSI Node      → Running
EBS CSI Controller → CrashLoopBackOff
```

This distinction makes troubleshooting much more targeted.

---

## 5. IAM and Kubernetes are tightly connected in EKS

Controllers that need AWS API access commonly require an authentication mechanism connecting:

```text
Kubernetes Identity
        ↓
IAM Role
        ↓
AWS API Permissions
```

Understanding this relationship is essential for EKS troubleshooting.

---

## 6. Existing resources must be investigated before recreating them

A resource creation failure may actually mean:

```text
Resource already exists
```

Instead of deleting it immediately, determine whether it should be:

* Imported
* Reconciled
* Updated
* Reused

---

## 7. Not every component belongs in the final architecture

The EBS CSI investigation demonstrated that troubleshooting can also lead to architectural simplification.

A component may initially appear necessary but become unnecessary after the application architecture changes.

---

## 8. CI infrastructure needs capacity planning

Jenkins resource requirements depend on the pipeline workload.

Security scanning, static analysis, Docker builds, and registry operations can consume significantly more resources than the application itself.

---

## 9. Infrastructure should be replaceable

Backing up Jenkins configuration to S3 separates operational state from the underlying EC2 server.

This improves migration and recovery capabilities.

---

## 10. Simplify troubleshooting by isolating layers

Validating Kubernetes routing locally before introducing AWS ALB infrastructure reduces the number of variables involved in cloud troubleshooting.

A good troubleshooting strategy is therefore:

```text
Application
    ↓
Kubernetes
    ↓
Cloud Integration
    ↓
AWS Infrastructure
```

rather than debugging every layer simultaneously.

---

# Final Project Architecture

The overall platform evolved toward:

```text
                         GitHub
                           │
             ┌─────────────┴─────────────┐
             │                           │
          Jenkins                     Argo CD
             │                           │
      CI / Security                 GitOps Sync
             │                           │
      ┌──────┴──────┐                    │
      │             │                    │
   Docker        Terraform                │
      │             │                    │
      ▼             ▼                    ▼
    ECR          AWS Infrastructure → Amazon EKS
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                 Frontend           API             Monitoring
                    │                 │              Prometheus
                    │                 │              Grafana
                    │                 │
                    └────────┬────────┘
                             │
                      Kubernetes Services
                             │
                         Ingress / ALB
                             │
                           Users

API
 │
 └──────────────→ MongoDB Atlas
```

---

# Final Takeaway

This project provided hands-on experience troubleshooting failures across the complete DevOps stack:

```text
Git
 ↓
Jenkins
 ↓
Terraform
 ↓
AWS
 ↓
EKS
 ↓
Kubernetes
 ↓
Ingress
 ↓
Application
 ↓
Monitoring
```

The most important outcome was not simply provisioning the infrastructure.

It was developing the ability to move systematically from:

```text
Symptom
  ↓
Evidence
  ↓
Failing Layer
  ↓
Root Cause
  ↓
Targeted Fix
  ↓
Verification
  ↓
Architectural Decision
```

These incidents demonstrate practical experience with infrastructure failures, cloud authentication, Kubernetes operations, Terraform state management, CI resource constraints, networking, ingress, GitOps, and infrastructure lifecycle management.
