# Timely

[![Live App](https://img.shields.io/badge/Live_App-diary.sineops.app-brightgreen?style=flat-square)](https://diary.sineops.app/)

Timely is a productivity management app with an integrated diary. It helps you plan
your time, stay on top of todos, and capture daily diary entries — with dashboards
that show how your time and mood trend. Built as a React frontend with a
Node.js/Express backend.

## What the app does

- Helps you manage time and priorities with todo tracking, status, and filters.
- Lets users register, log in, and manage a private session with JWT cookies.
- Captures diary entries with text, mood, dates, links, and image uploads.
- Stores media in AWS S3 and serves private assets through CloudFront-signed delivery.
- Shows dashboard insights such as recent entries, mood distribution, and activity summaries.
- Exposes health endpoints and Swagger API documentation.

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Redis for recent-entry caching
- AWS S3 and CloudFront for media storage and delivery
- Swagger for API docs
- Jest and Supertest for tests

### Frontend
- React 19 + Vite
- React Router
- Tailwind CSS v4
- Radix UI components
- Recharts for charts
- Framer Motion for animations

### Infrastructure
- Docker + Docker Compose for containerized local and production runs
- Ansible for server provisioning and configuration management
- Nginx as a reverse proxy in front of the API
- GitHub Actions for CI/CD (tests, VM configuration, deployment)
- Prometheus for metrics collection
- Grafana for dashboards and managed alerting
- fail2ban for SSH and scanner brute-force protection

## Infrastructure & Deployment

The deployment story lives in the repo alongside the application code, so a
environment can be reproduced from scratch rather than documented in someone's
head.

### Containerization
- `backend/Dockerfile` — containerizes the API
- `backend/docker-compose.yml` — wires the API together with Redis for local runs

### Configuration management (`ansible/`)
- `ansible/site.yml` — provisions and configures the server
- `ansible/templates/api.nginx.conf.j2` — Nginx reverse-proxy config rendered per environment
- `ansible/templates/fail2ban-jail.local.j2` — fail2ban jail definitions
- `ansible/templates/fail2ban-nginx-scanners.conf.j2` — drops requests from known bad scanner user agents
- `ansible/inventory.ini.example` — inventory template (real inventory is gitignored)

### CI/CD (`.github/workflows/`)
- `backend-tests.yml` — runs the Jest/Supertest suite
- `configure-vm.yml` — applies the Ansible playbook to the target host
- `deploy-backend.yml` — builds and deploys the API

### Observability (`backend/`)
- `backend/prometheus.yml` — scrape configuration for application metrics
- `backend/grafana/provisioning/datasources/prometheus.yml` — auto-provisioned Prometheus datasource
- `backend/grafana/dashboards/diary-backend.json` — request, failure, log and endpoint metrics
- `backend/grafana/provisioning/alerting/alert-rules.yml` — alert definitions (e.g. high error ratio)
- `backend/grafana/provisioning/alerting/contact-points.yml` — email notification channel
- `backend/grafana/provisioning/alerting/notification-policies.yml` — routing and escalation

Alerting runs as Grafana managed alerting rather than a separate Alertmanager,
which keeps rules, dashboards and notifications in one provisioned place.

## Repository Layout

- `.github/workflows/` — CI/CD pipeline definitions
- `ansible/` — server provisioning, Nginx and fail2ban templates
- `backend/` — API, database models, services, middleware, cron jobs, tests, and infra config
- `backend/grafana/` — dashboards and alerting provisioning
- `frontend/` — React UI, pages, shared components, and client services
- `cloud-task-manager.md` — project notes

## Main Features

- Authentication and session handling
- Diary CRUD and media upload flow
- Todo CRUD and status management
- Recent-entry caching and dashboard analytics
- User profile management
- Health checks and API documentation

## Local Setup

Typical local development uses:

- MongoDB on `localhost:27017`
- Backend on port `5000`
- Frontend on port `5173`

Environment values are never committed. Copy `backend/.env.example` to `backend/.env`
and fill in values for local development.

## Useful Commands

### Backend
- `npm test`
- `npm run dev`
- `npm start`

### Frontend
- `npm run dev`
- `npm run build`
- `npm run lint`

## Notes

- The project is designed as a responsive web app for desktop and mobile.
- Media and authentication depend on production-ready AWS and cookie settings.
