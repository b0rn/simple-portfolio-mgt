# Simple Portfolio App

> A production-grade portfolio management application demonstrating full-stack development, polyglot backend architecture, and enterprise-level best practices.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8.svg)](https://golang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/b0rn/simple-portfolio-mgt)
![GitHub last commit](https://img.shields.io/github/last-commit/b0rn/simple-portfolio-mgt)
![GitHub repo size](https://img.shields.io/github/repo-size/b0rn/simple-portfolio-mgt)

---

**Live Demo:** [spa.demos.vleveneur.com](https://spa.demos.vleveneur.com)
| **API Documentation:** [OpenAPI Spec](https://b0rn.github.io/simple-portfolio-mgt/api/)
| **Test Reports:** [Tests + Coverage + Load tests](https://b0rn.github.io/simple-portfolio-mgt/)
| **Monitoring Dashboard:** Coming Soon

---

## 📖 Table of Contents

- [Overview](#-overview)
- [What This Project Demonstrates](#-what-this-project-demonstrates)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Status](#-project-status)
- [Getting Started](#-getting-started)
- [Documentation](#-documentation)
- [Performance Benchmarks](#-performance-benchmarks)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎯 Overview

Simple Portfolio App is a financial portfolio management system that allows users to:
- Create and manage investment portfolios
- Track assets (stocks, crypto, etc.) with real-time valuations
- Monitor performance with comprehensive dashboards

**Why this project exists:** This is a showcase project demonstrating my ability to build production-ready, scalable applications across multiple technology stacks while maintaining consistent API contracts, security standards, and architectural patterns.

---

## 💡 What This Project Demonstrates

### Backend Engineering
- **Polyglot Architecture**: Same RESTful API implemented in 5 languages (Python, Go, Java, Node.js, PHP)
- ✅ **Clean Architecture**: Domain-Driven Design (DDD) with clear separation of concerns
- ✅ **API-First Development**: OpenAPI 3.1 specification with consistent responses across all implementations
- ✅ **Database Expertise**: PostgreSQL with efficient querying, connection pooling
- ✅ **Authentication & Security**: JWT-based auth with HttpOnly cookies, secure password hashing (bcrypt/argon2)

### DevOps & Infrastructure
- ✅ **CI/CD Pipelines**: Automated testing, building, and deployment with GitHub Actions
- **Multiple Deployment Patterns**: Docker containers, Terraform, AWS CloudFormation, K8s, PM2 clusters
- ✅ **Infrastructure as Code**: Terraform for cloud, Ansible for VPS automation and AWS CloudFormation for AWS
- ✅ **Observability**: Structured logging, Prometheus metrics, Grafana dashboards, OpenTelemetry tracing

### Security & Quality
- ✅ **Security-First Mindset**: SAST/DAST with SonarQube, dependency scanning with Snyk, security headers
- ✅ **Comprehensive Testing**: Unit tests (>80% coverage), integration tests, E2E tests with Playwright
- ✅ **Production Hardening**: Rate limiting, input validation, SQL injection prevention, CSRF protection

### Performance & Scalability
- ✅ **Caching Strategy**: Using a cache for expensive queries, connection pooling optimization
- ✅ **Load Testing**: Performance benchmarks under realistic load scenarios
- ✅ **Performance Monitoring**: Real-time metrics, alerting, SLO tracking

### Advanced Features
- **Real-time Communication**: WebSocket support for live price updates
- **Modern Frontend**: Next.js with TypeScript, TanStack Query, responsive design

---

## 🏗️ Architecture

### System Architecture
Comming soon

### Database Schema

Comming soon

### Authentication Flow

Coming soon

## 🛠️ Tech Stack

### Backend Implementations

| Language | Framework | ORM/Database | Deployment |
|----------|-----------|--------------|------------|
| **Python** ✅ | FastAPI | SQLAlchemy 2.0 | Kubernetes (microk8s) |
| **Go** 🚧 | Standard Library | sqlc + pgx | systemd |
| **Node.js** 🚧 | Fastify | Sequelize | PM2 Cluster |
| **Java** 📋 | Spring Boot | Hibernate | Docker |
| **PHP** 📋 | Laravel | Eloquent | PHP-FPM + Nginx |

### Frontend

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **E2E**: Playwright

### Infrastructure & DevOps

- **Database**: PostgreSQL
- **Cache**: Redis 
- **Web Server**: Nginx
- **Monitoring**: Prometheus + Grafana
- **Tracing**: Jaeger (OpenTelemetry)
- **Logging**: Structured JSON logs + Loki
- **CI/CD**: GitHub Actions
- **IaC**: Terraform (AWS), Ansible (VPS), AWS CloudFormation
- **Containerization**: Docker + Docker Compose

### Security & Quality

- **SAST**: SonarQube
- **Dependency Scanning**: Snyk
- **Container Scanning**: Snyk
- **IaC Scanning** : Snyk
- **Code Coverage**: >80% across all implementations
- **API Testing**: Postman/Newman collections

---

## 📊 Project Status

### ✅ Completed

#### Python Backend (FastAPI)
- [x] All API endpoints implemented
- [x] Unit tests (85% coverage)
- [x] Integration tests
- [x] OpenAPI specification compliance
- [x] Authentication & authorization
- [x] Input validation
- [x] Error handling

#### Frontend (Next.js)
- [x] User authentication UI
- [x] Portfolio management
- [x] Asset management
- [x] Portfolio valuation display
- [x] Responsive design
- [x] TypeScript types

#### CI/CD Pipeline
- [x] Backend CI workflow (tests, lint, build)
- [x] Frontend CI workflow
- [x] Docker image optimization
- [x] Automated deployment to VPS
- [x] Security scanning in CI

#### Documentation
- [x] Complete README
- [x] DEPLOYMENT.md
- [x] API.md
- [x] Architecture diagrams

#### Phase 1: MVP Release
- [x] Structured logging
- [x] Prometheus metrics
- [x] Grafana dashboards
- [x] Health check endpoints
- [x] SECURITY.md documentation
- [x] E2E test suite
- [x] Production deployment

### 🚧 In Progress

#### Phase 2: Go Backend
- [ ] Complete Go implementation
- [ ] Systemd deployment
- [ ] Performance benchmarks
- [ ] Go-specific documentation

### 📋 Planned

#### Phase 3: Node.js Backend
- [ ] Complete Node.js implementation
- [ ] PM2 cluster deployment
- [ ] Performance comparison
- [ ] Multi-stack benchmarks

#### Phase 4: Performance & Caching
- [ ] Redis integration
- [ ] Cache strategy implementation
- [ ] Load testing (k6)
- [ ] Performance documentation

#### Phase 6: Real-time Features
- [ ] WebSocket implementation
- [ ] Real-time price updates
- [ ] Frontend integration
- [ ] Connection scaling strategy

#### Phase 7: Additional Stacks
- [ ] Java/Spring Boot implementation
- [ ] PHP/Laravel implementation
- [ ] Complete comparison matrix
- [ ] Demo video

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose (recommended)
- PostgreSQL 14+ (if running locally)
- golang-migrate CLI or Docker (for database migrations)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/b0rn/simple-portfolio-mgt.git
   cd simple-portfolio-mgt
   ```

2. **Set up the database:**
   ```bash
   # Start PostgreSQL (via Docker)
   docker-compose up -d postgres

   # Run database migrations
   cd database
   ./migrate.sh up
   ```

3. **Start the backend (choose one):** see ./backend/[languague]/README.md

4. **Start the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Database Migrations

This project uses [golang-migrate](https://github.com/golang-migrate/migrate) for backend-agnostic database migrations with raw SQL files.

**Quick Migration Commands:**

```bash
cd database

# Apply all pending migrations
./migrate.sh up

# Rollback last migration
./migrate.sh down 1

# Check current migration version
./migrate.sh version

# Create new migration
./migrate.sh create add_new_feature
```

**Features:**
- Backend-agnostic (pure SQL, works with any backend implementation)
- Works with CLI or Docker (no installation required)
- Automatic environment loading from `backend/.env`
- Safe rollback support with `.down.sql` files

For detailed migration documentation, see [database/README.md](database/README.md), which includes:
- Installation instructions for golang-migrate
- Complete command reference
- CI/CD integration examples (GitHub Actions, GitLab CI)
- Migration best practices
- Troubleshooting guide
- Database schema overview

## 📚 Documentation

### Core Documentation
- **[API Documentation](https://b0rn.github.io/simple-portfolio-mgt/api/)** - Complete API reference
- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System design and patterns
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - How to deploy to various environments
- **[Security Documentation](./docs/SECURITY.md)** - Security practices and threat model
- **[Performance Guide](./docs/PERFORMANCE.md)** - Benchmarks and optimization strategies

### Implementation Guides
- **[Python Backend](./backend-python/README.md)** - FastAPI implementation details
- **[Go Backend](./backend-go/README.md)** - Go implementation details
- **[Node.js Backend](./backend-nodejs/README.md)** - Fastify implementation details
- **[Frontend](./frontend/README.md)** - Next.js implementation details

---

## ⚡ Performance Benchmarks

> **Note:** Benchmarks will be added after Performance & Load Testing phase

### Target Performance Metrics

| Metric | Target | Status |
|--------|--------|--------|
| API Response Time (p95) | < 100ms | 🚧 Testing |
| API Response Time (p99) | < 200ms | 🚧 Testing |
| Database Query Time | < 50ms | 🚧 Testing |
| Cache Hit Rate | > 80% | 📋 Planned |
| Concurrent Users | 1,000+ | 📋 Planned |
| Uptime | 99.9% | 📋 Planned |

### Language Comparison (Preliminary)

*Comprehensive benchmarks coming soon*

| Language | Build Time | Binary Size | Memory Usage | Startup Time |
|----------|------------|-------------|--------------|--------------|
| Python | N/A | TBD | TBD | TBD |
| Go | TBD | TBD | TBD | TBD |
| Node.js | TBD | TBD | TBD | TBD |
| Java | TBD | TBD | TBD | TBD |
| PHP | N/A | TBD | TBD | TBD |

---

## 🗺️ Roadmap

### Phase 1: MVP ⭐
**Goal:** Production-ready Python + Next.js deployment

- [x] Complete backend implementation
- [x] Complete frontend implementation
- [x] CI/CD pipeline
- [x] Observability stack
- [x] Security documentation
- [x] E2E tests
- [x] Production deployment

---

### Phase 2: Multi-Stack Implementation
**Goal:** Demonstrate polyglot architecture

- [ ] Go backend (systemd deployment)
- [ ] Node.js backend (PM2 deployment)
- [ ] Performance comparison
- [ ] Documentation updates

---

### Phase 3: Advanced Features
**Goal:** Production-grade features and performance

- [ ] Redis caching layer
- [ ] Load testing & benchmarks
- [ ] WebSocket real-time updates

---

### Phase 4: Complete Polyglot
**Goal:** Full 5-language implementation

- [ ] Java/Spring Boot implementation
- [ ] PHP/Laravel implementation
- [ ] Complete comparison matrix

---

### Future Enhancements
**Potential additions based on feedback:**

- [ ] GraphQL API alongside REST
- [ ] Mobile app (React Native)
---

## 🎯 Key Learning Outcomes

This project demonstrates mastery of:

### Architecture & Design
- Clean Architecture principles across multiple languages
- Domain-Driven Design (DDD)
- API-first development
- Microservices patterns (polyglot architecture)
- Database design and normalization
- Caching strategies and invalidation

### Backend Development
- RESTful API design
- Authentication & authorization (JWT, cookies)
- ORM usage and raw SQL when appropriate
- Error handling and validation
- Asynchronous programming (where applicable)

### DevOps & Operations
- CI/CD pipeline design
- Multiple deployment strategies
- Infrastructure as Code (Terraform, Ansible , AWS CloudFormation)
- Container orchestration
- Monitoring and observability
- Log aggregation and analysis

### Security
- OWASP Top 10 mitigations
- Secure password storage
- Token-based authentication
- Input validation and sanitization
- Security headers
- Dependency management
- Vulnerability scanning

### Testing
- Unit testing strategies
- Integration testing
- End-to-end testing
- Performance testing
- Security testing
- Test automation

### Performance
- Query optimization
- Caching strategies
- Connection pooling
- Load balancing
- Performance profiling
- Scalability patterns

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 👤 Author

**Victor Leveneur**
- **LinkedIn**: [linkedin.com/in/victorleveneur](https://www.linkedin.com/in/victorleveneura1)
- **GitHub**: [@b0rn](https://github.com/b0rn)
- **GitLab**: [@b0rn](https://gitlab.com/b0rn)

---

## 🙏 Acknowledgments

- **FastAPI** - Modern Python web framework
- **Next.js** - React framework for production
- **PostgreSQL** - Robust relational database
- **The open-source community** - For amazing tools and libraries

## 🎓 Educational Purpose

This project was created as a comprehensive portfolio piece to demonstrate:
- Production-ready full-stack development skills
- Multi-language backend proficiency
- DevOps and infrastructure expertise
- Security-first mindset
- Clean code and architectural principles
- Professional documentation practices

**Status Legend:**
- ✅ **Completed** - Fully implemented and tested
- 🚧 **In Progress** - Currently being developed
- 📋 **Planned** - Scheduled for future implementation
- ⭐ **Current Focus** - Active development phase
