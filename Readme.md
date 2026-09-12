## GitOps with ArgoCD

ArgoCD was deployed on Amazon EKS to implement a **GitOps-based Continuous Delivery workflow**.

Kubernetes manifests stored in Git represent the desired state of the application. ArgoCD continuously compares this desired state with the resources running in the EKS cluster and synchronizes them when differences are detected.

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
Three-Tier Application
```

### What I Implemented

* Installed ArgoCD on Amazon EKS using the official ArgoCD installation manifest.
* Exposed the ArgoCD UI using a Kubernetes `LoadBalancer` Service for administrative access.
* Connected Git-managed Kubernetes manifests with the EKS cluster.
* Implemented GitOps-based deployment and synchronization.
* Demonstrated **Auto Sync** for automatically applying changes committed to Git.
* Demonstrated **Auto Heal** for reconciling configuration drift between Git and the running Kubernetes resources.

### GitOps Principle

```text
Desired State (Git)
        │
        ▼
      ArgoCD
        │
        ▼
Actual State (EKS Cluster)
```

Git acts as the **single source of truth** for Kubernetes application configuration. Any changes committed to Git can be automatically synchronized to the cluster, while manual changes made directly in the cluster can be detected and reconciled according to the ArgoCD synchronization policy.

📖 **Detailed ArgoCD installation, verification commands, architecture, limitations, and implementation notes:**

```text
argocd/
    └── README.md
```


nat gateway
manuall installatioj like helm ,oidc
