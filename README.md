## Law Firm Case File & Access Management System

This is a production-style monorepo for a **Law Firm Case File & Access Management System** used to manage cases, documents, and access control in a legal environment (law firm or court).

### Tech Stack

- **Frontend**: React (Vite), React Router, Axios, Tailwind CSS  
- **Backend**: Node.js, Express.js, JWT Authentication, Role-Based Access Control (RBAC), Multer for uploads  
- **Database**: PostgreSQL with Prisma ORM  
- **DevOps**: Docker, Docker Compose, Kubernetes, Jenkins, Prometheus, Grafana

### Monorepo Structure

- `frontend/` – React + Vite + Tailwind dashboard UI  
- `backend/` – Express API, Prisma, JWT auth, RBAC, file uploads, metrics  
- `database/` – Database-related assets (e.g. init scripts)  
- `devops/`
  - `docker/` – Docker-related auxiliary configs (Prometheus, Grafana, etc.)  
  - `kubernetes/` – Kubernetes manifests  
  - `jenkins/` – Jenkins-related assets

---

## Local Development with Docker Compose

### Prerequisites

- Docker & Docker Compose

### Quick Start

From the project root `law-firm-system/`:

```bash
docker-compose up --build
```

Then (first time only) run Prisma migrations in the backend container:

```bash
docker compose exec backend npx prisma migrate dev --name init
```

Services:

- **Frontend**: `http://localhost:5173`  
- **Backend API**: `http://localhost:4000`  
- **PostgreSQL**: `localhost:5432` (internal only)  
- **Prometheus**: `http://localhost:9090`  
- **Grafana**: `http://localhost:3000`

> The backend exposes a `/metrics` endpoint (Prometheus format) on port `4000`.

---

## Environment Configuration

### Backend `.env`

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/law_firm_db?schema=public"
JWT_SECRET="supersecretjwtkey_change_me"
PORT=4000
NODE_ENV=development
UPLOAD_DIR=/usr/src/app/uploads
```

### Frontend `.env`

Create `frontend/.env`:

```env
VITE_API_BASE_URL="http://localhost:4000/api"
```

Docker Compose and Kubernetes manifests assume these values by default.

---

## Project Components

### Backend (Express + Prisma)

- JWT-based authentication (`/api/auth/login`, `/api/auth/register`)  
- RBAC with roles: **Admin**, **Judge**, **Lawyer**, **Clerk**  
- CRUD for users, cases, and documents  
- File uploads using Multer, stored under `uploads/`  
- Access logging for document viewing and downloading  
- Prometheus metrics at `/metrics`

### Frontend (React + Vite + Tailwind)

- **Login page** with email/password and validation  
- **Dashboard** with cards: total cases, active cases, documents, pending cases  
- **Cases list** with table and view buttons  
- **Case details** with assigned judge, lawyers, status, and documents list  
- **Upload document** page with file upload and document type selection  
- **User management** (Admin only) with create, edit, delete  
- **Navbar** and **Sidebar** layout with responsive legal-theme styling

---

## Running Prisma Migrations (Optional Local Non-Docker)

If you run the backend directly (not via Docker):

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

Ensure PostgreSQL is running and `DATABASE_URL` in `backend/.env` matches your local database.

---

## Kubernetes Deployment (High-Level)

Kubernetes manifests live under `devops/kubernetes/k8s/`:

- `frontend-deployment.yaml`  
- `backend-deployment.yaml`  
- `postgres-deployment.yaml`  
- `services.yaml`

Apply them (after building and pushing Docker images configured in the `Jenkinsfile`):

```bash
kubectl apply -f devops/kubernetes/k8s/
```

You may need to adjust image names, namespaces, and ingress configuration for your cluster.

---

## CI/CD with Jenkins

A `Jenkinsfile` at the project root defines a declarative pipeline with stages:

1. Install dependencies  
2. Run tests  
3. Build Docker images  
4. Push images to a container registry  
5. Deploy to Kubernetes

Configure Jenkins with:

- Docker installed on the agent  
- Access to your Docker registry (credentials)  
- `kubectl` configured to access your Kubernetes cluster

---

## Monitoring (Prometheus & Grafana)

Prometheus and Grafana configs live in `devops/docker/`.  
Prometheus scrapes the backend `/metrics` endpoint, and Grafana can be configured with dashboards to visualize:

- Request rate  
- Error rate  
- Latency histograms  
- Per-endpoint metrics

You can customize `prometheus.yml` and Grafana provisioning as needed.

