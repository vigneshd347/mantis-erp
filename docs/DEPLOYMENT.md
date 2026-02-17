
# Deployment Guide: SaaS ERP System

## Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Docker & Docker Compose
- AWS Account (EC2 / RDS)

---

## 1. Local Development (Docker)

To run the entire stack locally:

1. Clone repo: `git clone ...`
2. Configure `.env` (Database URL, Stripe Keys, SendGrid Keys)
3. Run:
```bash
docker-compose up --build
```
This starts:
- `backend` (Express API)
- `frontend` (Next.js)
- `postgres` (Primary DB)
- `pgadmin` (DB Client)

---

## 2. Production Architecture (AWS)

We recommend a standard **Elastic Beanstalk** (PaaS) or **EC2 Auto-Scaling Group** setup with **RDS PostgreSQL**.

### Architecture Diagram
[Load Balancer (ALB)] -> [Backend Instances (Node.js)] -> [RDS (Postgres)]
[CloudFront (CDN)] -> [Frontend Hosting (Vercel / S3)]

### Step-by-Step Deployment

**A. Database (RDS)**
1. Launch an RDS Instance (PostgreSQL 14, standard instance).
2. Configure Security Group to allow access ONLY from Backend Security Group.
3. Get Connection String: `postgresql://user:pass@endpoint:5432/dbname`

**B. Backend (Elastic Beanstalk / Docker)**
1. Use the provided `Dockerfile` in `/backend`.
2. Push your image to ECR (Elastic Container Registry).
3. Create an EB Environment ("Web Server Environment").
4. Configure EB Environment Variables with `.env` secrets.
5. Deploy `Dockerrun.aws.json`.

**C. Frontend (Vercel / AWS Amplify)**
1. Push `/frontend` to GitHub.
2. Connect Repo to Vercel/Amplify.
3. Set Build Command: `npm run build`.
4. Set Output Directory: `.next`.
5. Configure Environment Variables (`NEXT_PUBLIC_API_URL`).

---

## 3. CI/CD (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker Image
        run: docker build -t my-app/backend ./backend
      - name: Push to ECR
        run: ...
      - name: Deploy to EB
        run: eb deploy
```

---

## 4. Monitoring & Backup

- **CloudWatch**: Monitor CPU/Memory usage.
- **RDS Automated Backups**: Enable auto-backups (7 days retention).
- **Log Management**: Forward logs to CloudWatch or Datadog.

