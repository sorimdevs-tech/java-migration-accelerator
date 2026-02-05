# Java Migration Accelerator
## Enterprise Architecture Document

**Version:** 1.0  
**Date:** February 4, 2026  
**Status:** Production Ready  
**Classification:** Technical Architecture  

---

## Executive Summary

The Java Migration Accelerator is an enterprise-grade, end-to-end automated solution for migrating Java applications from Java 7 through Java 21, with comprehensive framework modernization capabilities. The system provides intelligent analysis, automated code transformation, quality assurance, and detailed reporting—enabling organizations to modernize legacy Java applications with minimal manual intervention.

### Key Capabilities
- ✅ **Multi-Version Support:** Java 7→21 automated upgrades
- ✅ **Framework Modernization:** Spring Boot 2→3, Jakarta EE, JUnit 4→5
- ✅ **Smart Analysis:** Dependency mapping, framework detection, code quality assessment
- ✅ **Automated Transformations:** 18+ code quality recipes with OpenRewrite
- ✅ **Multi-Platform:** GitHub & GitLab integration with automatic PR/MR creation
- ✅ **Quality Reports:** HTML reports, JMeter test plans, SonarQube integration
- ✅ **Email Notifications:** Migration summaries and progress alerts
- ✅ **Cloud-Ready:** Docker containerized, deployable to Railway, Render, Kubernetes

---

## System Architecture Overview

```
╔════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                 JAVA MIGRATION ACCELERATOR                                                 ║
║                                    End-to-End Solution                                                     ║
╚════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          CLIENT LAYER                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                          WEB BROWSER / FRONTEND APPLICATION                                          │   │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐  │   │
│  │  │  React 18+ Application (TypeScript)                                                             │  │  │
│  │  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │  │  │
│  │  │  │ Landing Page     │  │ Migration Wizard │  │ Dashboard        │  │ Report Viewer    │       │  │  │
│  │  │  │ - Overview       │  │ - Repository     │  │ - Progress       │  │ - Migration      │       │  │  │
│  │  │  │ - Features       │  │ - Target Java    │  │ - Logs           │  │ - Analysis       │       │  │  │
│  │  │  │ - Quick Start    │  │ - Conversions    │  │ - Statistics     │  │ - Metrics        │       │  │  │
│  │  │  │                  │  │ - Preview        │  │ - Errors         │  │ - Export         │       │  │  │
│  │  │  └────────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘       │  │  │
│  │  │                                                                                                  │  │  │
│  │  │  Shared Components:                                                                             │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │ Header | Sidebar | TopBar | Footer | Auth Callback                                      │   │  │  │
│  │  │  └─────────────────────────────────────────────────────────────────────────────────────────┘   │  │  │
│  │  └────────────────────────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                                      │  │
│  │  API Client (src/services/api.ts):                                                                  │  │
│  │  ├─ REST API Calls                                                                                  │  │
│  │  ├─ Error Handling                                                                                  │  │
│  │  ├─ Authentication                                                                                  │  │
│  │  └─ Token Management                                                                                │  │
│  │                                                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                     │
                                                     │ HTTP/REST
                                                     │ (Port 8001)
                                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    APPLICATION LAYER (FastAPI)                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  API Router & Endpoints (main.py)                                                                    │  │
│  │                                                                                                      │  │
│  │  ┌───────────────────┐  ┌────────────────────┐  ┌──────────────────┐  ┌────────────────────────┐  │  │
│  │  │ Migration Routes  │  │ Repository Routes  │  │ Report Routes    │  │ Authentication Routes │  │  │
│  │  ├───────────────────┤  ├────────────────────┤  ├──────────────────┤  ├────────────────────────┤  │  │
│  │  │ /api/migration    │  │ /api/github        │  │ /api/migration   │  │ /auth/login            │  │  │
│  │  │ /start            │  │ /repos             │  │ /{id}/report     │  │ /auth/logout           │  │  │
│  │  │ /{id}             │  │ /analyze-url       │  │ /download        │  │ /auth/callback         │  │  │
│  │  │ /{id}/status      │  │ /gitlab            │  │                  │  │ /oauth/authorize       │  │  │
│  │  │ /preview          │  │ /repos             │  │ /api/jmeter      │  │                        │  │  │
│  │  │ /java-versions    │  │ /branches          │  │ /{id}/jmeter     │  │                        │  │  │
│  │  │ /conversion-types │  │                    │  │                  │  │                        │  │  │
│  │  └───────────────────┘  └────────────────────┘  └──────────────────┘  └────────────────────────┘  │  │
│  │                                                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                              ▲                                                                           │
│                              │                                                                           │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Business Logic Layer (Services)                                                                     │  │
│  │                                                                                                      │  │
│  │  ┌─────────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐                   │  │
│  │  │ migration_service.py    │  │ github_service.py    │  │ email_service.py     │                   │  │
│  │  ├─────────────────────────┤  ├──────────────────────┤  ├──────────────────────┤                   │  │
│  │  │ • Migration Planning    │  │ • GitHub API Client  │  │ • Email Notifications│                   │  │
│  │  │ • Migration Execution   │  │ • Repo Analysis      │  │ • SMTP Configuration │                   │  │
│  │  │ • OpenRewrite Recipes   │  │ • Branch Detection   │  │ • Email Templates    │                   │  │
│  │  │ • Job Tracking (UUID)   │  │ • Commit Info        │  │ • Error Alerts       │                   │  │
│  │  │ • Status Management     │  │ • Rate Limiting      │  │                      │                   │  │
│  │  │ • Progress Reporting    │  │ • Error Handling     │  │                      │                   │  │
│  │  └─────────────────────────┘  └──────────────────────┘  └──────────────────────┘                   │  │
│  │                                                                                                      │  │
│  │  ┌──────────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐                  │  │
│  │  │ gitlab_service.py        │  │ sonarqube_service.py │  │ repository_analyzer  │                  │  │
│  │  ├──────────────────────────┤  ├──────────────────────┤  ├──────────────────────┤                  │  │
│  │  │ • GitLab API Client      │  │ • Code Quality       │  │ • Dependency Analysis│                  │  │
│  │  │ • GitLab Integration     │  │ • SonarQube API      │  │ • Java Version Check │                  │  │
│  │  │ • Project Management     │  │ • Quality Gates      │  │ • Framework Detection│                  │  │
│  │  │ • Token Handling         │  │ • Metrics Collection │  │ • Tech Stack Analysis│                  │  │
│  │  └──────────────────────────┘  └──────────────────────┘  └──────────────────────┘                  │  │
│  │                                                                                                      │  │
│  │  ┌──────────────────────────┐  ┌──────────────────────┐                                            │  │
│  │  │ dependency_updater.py    │  │ rate_limiter.py      │                                            │  │
│  │  ├──────────────────────────┤  ├──────────────────────┤                                            │  │
│  │  │ • Maven Updates          │  │ • API Rate Limiting  │                                            │  │
│  │  │ • Gradle Updates         │  │ • Backoff Strategy   │                                            │  │
│  │  │ • Dependency Resolution  │  │ • Retry Logic        │                                            │  │
│  │  └──────────────────────────┘  └──────────────────────┘                                            │  │
│  │                                                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Migration Engine (OpenRewrite)                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Java Transformation Recipes:                                                                  │  │  │
│  │  │  ├─ Java Version Upgrades (7→8→11→17→21)                                                      │  │  │
│  │  │  ├─ Framework Migrations                                                                      │  │  │
│  │  │  │  ├─ Spring Boot 2 → 3                                                                     │  │  │
│  │  │  │  ├─ javax → jakarta                                                                       │  │  │
│  │  │  │  ├─ JUnit 4 → 5                                                                           │  │  │
│  │  │  │  └─ Log4j → SLF4J                                                                         │  │  │
│  │  │  ├─ Code Quality Improvements (18+ recipes)                                                  │  │  │
│  │  │  │  ├─ Null Safety (Objects.equals)                                                         │  │  │
│  │  │  │  ├─ Performance (StringBuilder)                                                           │  │  │
│  │  │  │  ├─ Collections & Streams                                                                │  │  │
│  │  │  │  └─ Exception Handling                                                                   │  │  │
│  │  │  └─ Custom Business Logic Recipes                                                            │  │  │
│  │  └────────────────────────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                    │                          │                          │
                    │ Git Operations           │ API Calls                │ Report Generation
                    │                          │                          │
                    ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    EXTERNAL INTEGRATIONS                                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │   GitHub Platform    │  │   GitLab Platform    │  │ SonarQube Instance   │  │    SMTP Server       │  │
│  ├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤  │
│  │ • Clone Repos        │  │ • Clone Repos        │  │ • Code Quality       │  │ • Send Notifications │  │
│  │ • Fetch Code         │  │ • Fetch Code         │  │ • Analyze Results    │  │ • Email Alerts       │  │
│  │ • Push Changes       │  │ • Push Changes       │  │ • Quality Gates      │  │ • Report Delivery    │  │
│  │ • Branch Management  │  │ • Branch Management  │  │ • Metrics Storage    │  │                      │  │
│  │ • Rate Limits: 5000  │  │ • Rate Limits: 10k   │  │ • Dashboard URL      │  │                      │  │
│  │ • OAuth Support      │  │ • Personal Tokens    │  │ • REST API           │  │                      │  │
│  │ • Personal Tokens    │  │                      │  │                      │  │                      │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘  └──────────────────────┘  │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                    │                          │                          │
                    │ File System              │ Git Repos                │ JSON/HTML
                    │                          │                          │
                    ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    STORAGE & PERSISTENCE                                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                             │
│  ┌──────────────────────────────────┐  ┌──────────────────────────────────┐                              │
│  │   Local Filesystem               │  │   Temporary Storage              │                              │
│  ├──────────────────────────────────┤  ├──────────────────────────────────┤                              │
│  │ • /tmp/migrations/               │  │ • Cache Directory                │                              │
│  │   ├─ Project clones              │  │ • Analysis Results               │                              │
│  │   ├─ OpenRewrite results         │  │ • Migration Plans                │                              │
│  │   ├─ Generated code              │  │ • JMeter Test Plans              │                              │
│  │   └─ Migration artifacts         │  │ • HTML Reports                   │                              │
│  │ • /app/logs/                     │  │ • Temporary build files          │                              │
│  │   └─ Application logs            │  │                                  │                              │
│  │ • /app/data/                     │  │                                  │                              │
│  │   └─ Session data                │  │                                  │                              │
│  └──────────────────────────────────┘  └──────────────────────────────────┘                              │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         DATA FLOW                                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                             │
│  USER INITIATES MIGRATION:                                                                                 │
│  ───────────────────────                                                                                   │
│                                                                                                             │
│  1. Frontend (React)                                                                                        │
│     └─→ User fills migration wizard                                                                       │
│         ├─ Select GitHub/GitLab repo                                                                      │
│         ├─ Choose target Java version (7→21)                                                              │
│         ├─ Select conversion types                                                                        │
│         └─ Click "Start Migration"                                                                        │
│                                                                                                             │
│  2. API Call (HTTP POST)                                                                                   │
│     └─→ POST /api/migration/start                                                                         │
│         ├─ Repository URL                                                                                 │
│         ├─ Target Java version                                                                            │
│         ├─ Conversion types array                                                                         │
│         ├─ GitHub/GitLab token                                                                            │
│         └─ Email for notifications                                                                        │
│                                                                                                             │
│  3. Backend Processing (FastAPI)                                                                           │
│     └─→ migration_service.start_migration()                                                               │
│         ├─ Generate Job ID (UUID)                                                                         │
│         ├─ Validate inputs                                                                                │
│         ├─ github_service.analyze_repository()                                                            │
│         │  ├─ Fetch repo metadata                                                                         │
│         │  ├─ Detect Java version                                                                         │
│         │  ├─ List dependencies                                                                           │
│         │  └─ Analyze framework usage                                                                     │
│         ├─ repository_analyzer.analyze()                                                                  │
│         │  ├─ Parse pom.xml / build.gradle                                                                │
│         │  ├─ Extract dependencies                                                                        │
│         │  └─ Generate analysis report                                                                    │
│         ├─ Clone repository to /tmp/migrations/{job_id}                                                    │
│         ├─ OpenRewrite recipes application                                                                │
│         │  ├─ Configure recipe trees                                                                      │
│         │  ├─ Scan source files                                                                           │
│         │  ├─ Apply transformations                                                                       │
│         │  └─ Generate visitor reports                                                                    │
│         ├─ dependency_updater.update_dependencies()                                                       │
│         │  ├─ Update Maven/Gradle                                                                         │
│         │  └─ Resolve conflicts                                                                           │
│         ├─ sonarqube_service.analyze()                                                                    │
│         │  ├─ Run SonarQube scan                                                                          │
│         │  └─ Fetch quality metrics                                                                       │
│         ├─ Generate HTML report                                                                           │
│         ├─ Generate JMeter test plan                                                                      │
│         └─ Prepare commit changes                                                                         │
│                                                                                                             │
│  4. Repository Update                                                                                      │
│     └─→ Push changes to GitHub/GitLab                                                                     │
│         ├─ Create new branch (migrated-{timestamp})                                                       │
│         ├─ Commit all changes                                                                             │
│         ├─ Create Pull Request / Merge Request                                                            │
│         └─ Add migration report                                                                           │
│                                                                                                             │
│  5. Notification                                                                                           │
│     └─→ email_service.send_notification()                                                                 │
│         ├─ Migration summary                                                                              │
│         ├─ Report link                                                                                    │
│         ├─ Statistics                                                                                      │
│         └─ Next steps                                                                                     │
│                                                                                                             │
│  6. Frontend Updates                                                                                       │
│     └─→ Poll /api/migration/{job_id}                                                                      │
│         ├─ Display progress                                                                               │
│         ├─ Show logs                                                                                      │
│         ├─ Final report download                                                                          │
│         └─ Success notification                                                                           │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DOCKER CONTAINER ARCHITECTURE                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                         Docker Image (1.59 GB)                                                       │  │
│  │  Size: 670df7648a95da1b3334cbff7e51d5f60987b677a5be3fb485e5b6f198715ea5                            │  │
│  │                                                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Multi-Stage Build                                                                              │  │  │
│  │  │                                                                                                │  │  │
│  │  │  Stage 1: Frontend Builder (Node 18 Alpine)                                                   │  │  │
│  │  │  ├─ npm ci (install dependencies)                                                             │  │  │
│  │  │ └─ npm run build → /dist                                                                      │  │  │
│  │  │                                                                                                │  │  │
│  │  │  Stage 2: Final Image (Python 3.11 Slim)                                                      │  │  │
│  │  │  ├─ Copy frontend dist → /app/static                                                          │  │  │
│  │  │  ├─ Install backend dependencies                                                              │  │  │
│  │  │  ├─ Java 17 JDK                                                                               │  │  │
│  │  │  ├─ Maven & Gradle                                                                            │  │  │
│  │  │  ├─ OpenRewrite                                                                               │  │  │
│  │  │  ├─ Git client                                                                                │  │  │
│  │  │  └─ All Python packages                                                                       │  │  │
│  │  │                                                                                                │  │  │
│  │  └────────────────────────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Runtime Container                                                                              │  │  │
│  │  │  Port Mapping: 8001:8001                                                                       │  │  │
│  │  │  Entry Point: python -u main.py                                                                │  │  │
│  │  │  Working Dir: /app                                                                             │  │  │
│  │  │                                                                                                │  │  │
│  │  │  ┌────────────────────────────────────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │  Environment Variables (from .env)                                                    │   │  │  │
│  │  │  │  ├─ GITHUB_TOKEN=ghp_... (authentication)                                              │   │  │  │
│  │  │  │  ├─ GITLAB_TOKEN=glpat_... (optional)                                                  │   │  │  │
│  │  │  │  ├─ WORK_DIR=/tmp/migrations (scratch space)                                           │   │  │  │
│  │  │  │  ├─ PYTHONUNBUFFERED=1 (logging)                                                       │   │  │  │
│  │  │  │  ├─ NODE_ENV=production                                                                │   │  │  │
│  │  │  │  ├─ SMTP_SERVER=smtp.gmail.com (notifications)                                         │   │  │  │
│  │  │  │  └─ SONARQUBE_TOKEN=... (code quality)                                                 │   │  │  │
│  │  │  └────────────────────────────────────────────────────────────────────────────────────────┘   │  │  │
│  │  │                                                                                                │  │  │
│  │  │  ┌────────────────────────────────────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │  Volume Mounts                                                                          │   │  │  │
│  │  │  │  ├─ /tmp/migrations → Host storage (migrations)                                        │   │  │  │
│  │  │  │  ├─ /app/logs → Host storage (logs)                                                    │   │  │  │
│  │  │  │  └─ /app/data → Host storage (data)                                                    │   │  │  │
│  │  │  └────────────────────────────────────────────────────────────────────────────────────────┘   │  │  │
│  │  │                                                                                                │  │  │
│  │  │  ┌────────────────────────────────────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │  Health Check                                                                           │   │  │  │
│  │  │  │  ├─ Interval: 30s                                                                      │   │  │  │
│  │  │  │  ├─ Timeout: 10s                                                                       │   │  │  │
│  │  │  │  ├─ Start Period: 40s                                                                  │   │  │  │
│  │  │  │  ├─ Retries: 3                                                                         │   │  │  │
│  │  │  │  └─ Test: curl -f http://localhost:8001/health                                        │   │  │  │
│  │  │  └────────────────────────────────────────────────────────────────────────────────────────┘   │  │  │
│  │  │                                                                                                │  │  │
│  │  └────────────────────────────────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                             │
│  Deployment Targets:                                                                                      │
│  ├─ Local: docker-compose up -d                                                                          │
│  ├─ Railway: railway up                                                                                   │
│  ├─ Render: push to render branch                                                                        │
│  ├─ Docker Hub: docker push yourusername/java-migration-accelerator                                     │
│  └─ Kubernetes: Use provided manifests                                                                    │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       TECHNOLOGY STACK                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                             │
│  FRONTEND STACK                          BACKEND STACK                      MIGRATION STACK              │
│  ──────────────────                      ────────────────                   ──────────────                │
│  • React 18+                             • FastAPI 0.100+                   • OpenRewrite 8+             │
│  • TypeScript                            • Python 3.9+                      • Java 17 JDK                │
│  • Vite (Build)                          • PyGithub                         • Maven 3.8+                 │
│  • ESLint (Linting)                      • GitLab-Python                    • Gradle 8+                  │
│  • CSS Modules                           • Uvicorn (ASGI)                   • ASM Library                │
│  • Axios/Fetch                           • Pydantic (Validation)            • Rewrite Recipes           │
│  • React Router                          • SQLAlchemy (optional)                                        │
│  • Redux/Context                         • Celery (async tasks)             EXTERNAL SERVICES           │
│                                          • APScheduler (scheduling)        • GitHub API v3              │
│  BUILD & DEPLOYMENT                      • Jinja2 (templating)             • GitLab API v4              │
│  ──────────────────                      • Requests (HTTP client)          • SonarQube API              │
│  • npm / Node.js                         • Python-dotenv                   • SMTP Email Service         │
│  • Docker                                • Logging (built-in)              • OAuth 2.0                  │
│  • Docker Compose                        • Rate Limiter                                                 │
│  • Vercel (optional)                                                       TOOLS & UTILITIES           │
│  • Railway                               TESTING & QUALITY                 • Git / Git CLI              │
│  • Render                                • Pytest                          • JMeter (testing)           │
│                                          • Coverage.py                     • FOSSA (dependencies)       │
│                                          • SonarQube Scanner               • curl (HTTP requests)       │
│                                          • Black (code formatter)          • OpenSSL                    │
│                                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Interaction Matrix

```
┌──────────────────┬─────────────┬──────────────┬──────────────┬─────────────┬──────────────┬──────────────┐
│   Component      │   GitHub    │   GitLab     │  SonarQube   │    Email    │   Storage    │  OpenRewrite │
├──────────────────┼─────────────┼──────────────┼──────────────┼─────────────┼──────────────┼──────────────┤
│ Frontend         │   Displays  │   Displays   │   Shows      │   Status    │   N/A        │   N/A        │
│                  │   Results   │   Results    │   Metrics    │   Updates   │              │              │
├──────────────────┼─────────────┼──────────────┼──────────────┼─────────────┼──────────────┼──────────────┤
│ Migration Service│   Clone     │   Clone      │   Triggers   │   Sends     │   Saves      │   Executes   │
│                  │   Push      │   Push       │   Analysis   │   Reports   │   Reports    │   Recipes    │
├──────────────────┼─────────────┼──────────────┼──────────────┼─────────────┼──────────────┼──────────────┤
│ Repository       │   Analyzes  │   Analyzes   │   N/A        │   N/A       │   Caches     │   N/A        │
│ Analyzer         │   Metadata  │   Metadata   │              │             │   Results    │              │
├──────────────────┼─────────────┼──────────────┼──────────────┼─────────────┼──────────────┼──────────────┤
│ Dependency       │   N/A       │   N/A        │   N/A        │   N/A       │   Reads      │   Uses       │
│ Updater          │             │              │              │             │   pom.xml    │   Recipes    │
├──────────────────┼─────────────┼──────────────┼──────────────┼─────────────┼──────────────┼──────────────┤
│ Email Service    │   N/A       │   N/A        │   Includes   │   Trigger   │   Attaches   │   N/A        │
│                  │             │              │   Metrics    │   Condition │   Reports    │              │
└──────────────────┴─────────────┴──────────────┴──────────────┴─────────────┴──────────────┴──────────────┘
```

## Key Paths & Files

```
Project Root: c:\Users\MSI\java-migration-accelerator\

Frontend Source:
└── src/
    ├── components/
    │   ├── MigrationWizard.tsx (Main UI)
    │   ├── RepositoryAnalysisPanel.tsx
    │   ├── DependencyAnalysis.tsx
    │   └── ... (other components)
    ├── services/
    │   └── api.ts (API client)
    └── types.ts (TypeScript interfaces)

Backend Source:
└── java-migration-backend/Java_Migration_Accelerator_backend/java-migration-backend/
    ├── main.py (FastAPI app)
    ├── services/
    │   ├── migration_service.py (Core logic)
    │   ├── github_service.py (GitHub integration)
    │   ├── gitlab_service.py (GitLab integration)
    │   ├── email_service.py (Notifications)
    │   ├── sonarqube_service.py (Code quality)
    │   ├── repository_analyzer.py (Analysis)
    │   ├── dependency_updater.py (Dependencies)
    │   ├── rate_limiter.py (API throttling)
    │   ├── auth_service.py (Authentication)
    │   └── fossa_service.py (License scanning)
    └── requirements.txt (Python dependencies)

Configuration:
├── .env (Environment variables)
├── docker-compose.yml (Container orchestration)
├── Dockerfile (Container image)
└── tsconfig.json, vite.config.ts, etc.

Output:
└── /tmp/migrations/ (During execution)
    ├── {job_id}/
    │   ├── original/ (Cloned repo)
    │   ├── migrated/ (After transformation)
    │   ├── reports/ (HTML & JMeter)
    │   └── logs/ (Operation logs)
```
