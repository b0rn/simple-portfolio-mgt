# Deployment Guide

## Python Backend (MicroK8s)

The Python backend (FastAPI) is deployed on a VPS running MicroK8s, using Helm for release management and GitHub Actions for CI/CD.

### Architecture Overview

```
GitHub Actions CI/CD
        │
        ▼
   GHCR (Docker Image)
        │
        ▼
  VPS (MicroK8s)
   ├── Helm Release: python-backend
   ├── Namespace: python-backend
   ├── Deployment (rolling update)
   ├── Service (NodePort :30001)
   ├── HPA (2–10 replicas)
   ├── ConfigMap (app config)
   └── Secret (DB creds, JWT)
```

### Docker Image

The image uses a multi-stage build based on `python:3.12-slim`:

- **Builder stage**: installs dependencies from `requirements.txt` into `/deps`
- **Runtime stage**: copies dependencies and application source, runs as non-root `appuser`
- **Entrypoint**: `uvicorn src.infrastructure.cmd.api:app --host 0.0.0.0 --port 8080`
- **Health check**: `GET http://localhost:8080/health` (30s interval, 5s timeout)

Images are pushed to `ghcr.io/<owner>/simple-portfolio-mgt/python-backend` and tagged with the git short SHA or the git tag (for tagged releases).

### Helm Chart

Located in `helm/python-backend/`.

#### Key Configuration (`values.yaml`)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `replicaCount` | 3 | Initial replica count (ignored when HPA is enabled) |
| `image.repository` | `ghcr.io/b0rn/simple-portfolio-mgt/python-backend` | Container image |
| `image.pullPolicy` | `IfNotPresent` | Image pull policy |
| `service.type` | `NodePort` | Service type |
| `service.port` | 80 | Service port |
| `service.nodePort` | 30001 | NodePort exposed on the host |
| `resources.requests.cpu` | 100m | CPU request |
| `resources.requests.memory` | 128Mi | Memory request |
| `resources.limits.cpu` | 500m | CPU limit |
| `resources.limits.memory` | 256Mi | Memory limit |
| `autoscaling.enabled` | true | Enable HPA |
| `autoscaling.minReplicas` | 2 | Minimum replicas |
| `autoscaling.maxReplicas` | 10 | Maximum replicas |
| `autoscaling.targetCPUUtilizationPercentage` | 70 | CPU scale threshold |
| `autoscaling.targetMemoryUtilizationPercentage` | 80 | Memory scale threshold |

#### Templates

- **Deployment** (`templates/deployment.yaml`): Rolling update strategy (`maxSurge: 1`, `maxUnavailable: 0`). Injects config via `envFrom` from both the ConfigMap and Secret. Liveness and readiness probes hit `/health`.
- **Service** (`templates/service.yaml`): NodePort service targeting container port 8080.
- **ConfigMap** (`templates/configmap.yaml`): Non-sensitive environment variables (`APP_NAME`, `APP_ENV`, `DB_PORT`, `DB_NAME`, `CORS_ORIGINS`, `AUTH_MODE`, etc.).
- **Secret** (`templates/secret.yaml`): Sensitive values (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`), base64-encoded.
- **HPA** (`templates/hpa.yaml`): Autoscaling/v2 HorizontalPodAutoscaler scaling on CPU and memory utilization.

#### Secrets Override

On the VPS, a file at `/opt/helm/python-backend-secrets.yaml` provides production secret values. This file is not checked into version control. It is passed to `helm upgrade` via `-f` if it exists.

### CI/CD Pipeline

Defined in `.github/workflows/python-backend.yaml`. Triggered on pushes to `main` or version tags (`v*`), and on PRs, when files under `backend/python/`, `helm/python-backend/`, or `database/` change.

#### Jobs

1. **Test & Coverage** (`test`)
   - Spins up a PostgreSQL 14 service container
   - Installs dependencies and runs database migrations (golang-migrate)
   - Lints with `ruff`, scans with `bandit`
   - Runs `pytest` with coverage, uploads to Codecov

2. **Security** (`security`) — requires `test`
   - Runs Snyk dependency vulnerability scanning
   - Uploads SARIF results to GitHub Code Scanning

3. **Build & Push** (`build`) — requires `test` + `security`, push events only
   - Builds the Docker image with BuildKit caching (GHA cache)
   - Pushes to GHCR
   - Runs Snyk container image scan

4. **Deploy** (`deploy`) — requires `build`, push events only
   - SSHs into the VPS
   - Syncs the Helm chart and database migrations via `rsync`
   - Runs database migrations on the VPS
   - Runs `microk8s helm3 upgrade --install` with the new image tag
   - Verifies rollout status

### Database Migrations

Migrations live in `database/migrations/` and use [golang-migrate](https://github.com/golang-migrate/migrate). The `database/migrate.sh` script wraps the CLI (falls back to the Docker image if the CLI is not installed).

```bash
# Apply all pending migrations
./database/migrate.sh up

# Rollback the last migration
./database/migrate.sh down 1

# Check current version
./database/migrate.sh version
```

### Manual Deployment

To deploy manually from the VPS:

```bash
# Pull the image (if using a private registry, authenticate first)
microk8s ctr image pull ghcr.io/b0rn/simple-portfolio-mgt/python-backend:<tag>

# Deploy with Helm
microk8s helm3 upgrade --install python-backend /opt/helm/python-backend \
  --namespace python-backend \
  --set image.tag=<tag> \
  -f /opt/helm/python-backend-secrets.yaml \
  --wait --timeout 5m

# Check status
microk8s kubectl get pods -n python-backend
microk8s kubectl rollout status deployment/python-backend -n python-backend
```

---

## Go Backend (systemd)

_This section will be documented once the Go backend is implemented._

### Service Configuration

<!-- TODO: systemd unit file details -->

### Building and Installing

<!-- TODO: build instructions, binary placement -->

### Managing the Service

<!-- TODO: systemctl commands, logs, restart policies -->

### Configuration

<!-- TODO: environment files, config file locations -->
