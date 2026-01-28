# Simple Portfolio App - Python Backend

A production-grade REST API built with FastAPI and SQLAlchemy, implementing Clean Architecture and Domain-Driven Design principles.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128.0-009688.svg)](https://fastapi.tiangolo.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0.36-red.svg)](https://www.sqlalchemy.org/)
[![Code Coverage](https://img.shields.io/badge/Coverage-80%25+-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Deployment](#deployment)

---

## Overview

This backend is written in Python. It uses FastAPI and SQLAlchemy, implementing a financial portfolio management API with the following features:

- ✅ **RESTful API** - Following OpenAPI 3.1 specification
- ✅ **Clean Architecture** - Separation of concerns across API, Domain, and Infrastructure layers
- ✅ **Domain-Driven Design** - Aggregates, use cases, and domain entities
- ✅ **Async Support** - Full async/await with asyncpg and SQLAlchemy 2.0
- ✅ **Type Safety** - Pydantic schemas for request/response validation
- ✅ **Authentication** - JWT tokens in HttpOnly cookies with Argon2 password hashing
- ✅ **Multiple Auth Providers** - Support for local auth and Supabase
- ✅ **Comprehensive Testing** - 80%+ test coverage with pytest
- ✅ **Database Migrations** - Schema versioning support
- ✅ **CORS Support** - Configurable cross-origin resource sharing

---

## Architecture

This backend follows **Clean Architecture** principles with three distinct layers:

```
┌─────────────────────────────────────────┐
│         API Layer (REST)                │
│  ┌────────────────────────────────┐     │
│  │ FastAPI Routes & Routers       │     │
│  │ Pydantic Schemas (validation)  │     │
│  │ Dependency Injection           │     │
│  └────────────────────────────────┘     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Domain Layer (Business Logic)   │
│  ┌────────────────────────────────┐     │
│  │ Use Cases (portfoliomgt,       │     │
│  │            authmgt)            │     │
│  │ Domain Entities (Portfolio,    │     │
│  │                  Asset, User)  │     │
│  │ Domain Exceptions              │     │
│  └────────────────────────────────┘     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│   Infrastructure Layer (External APIs)  │
│  ┌────────────────────────────────┐     │
│  │ Data Services (DB access)      │     │
│  │ SQLAlchemy Models              │     │
│  │ Auth Providers (Local/Supabase)│     │
│  │ Configuration (Settings)       │     │
│  └────────────────────────────────┘     │
└─────────────────────────────────────────┘
```

### Key Architectural Patterns

- **Dependency Injection**: Domain uses abstract classes instead of implementations.
- **Factory Pattern**: Auth and data service builders for flexible provider switching
- **Repository Pattern**: Data access abstraction via `dbdataservice` and `authdataservice`
- **Use Case Pattern**: Business logic encapsulated in discrete use case classes
- **Aggregate Pattern**: Domain entities grouped as aggregates (Portfolio, Asset, User)

---

## Project Structure

```
backend/python/
├── src/
│   ├── api/
│   │   └── rest/
│   │       ├── app.py                    # FastAPI application setup
│   │       ├── dependencies.py           # Dependency injection
│   │       ├── routers/                  # API route handlers
│   │       │   ├── auth.py              # Authentication endpoints
│   │       │   ├── portfolios.py         # Portfolio CRUD endpoints
│   │       │   ├── assets.py            # Asset management endpoints
│   │       │   └── health.py            # Health check endpoint
│   │       └── schemas/                  # Pydantic request/response models
│   │           ├── auth.py              # Auth schemas
│   │           ├── portfolio.py          # Portfolio schemas
│   │           ├── asset.py             # Asset schemas
│   │           ├── portfolio_valuation.py
│   │           ├── health.py
│   │           └── common.py            # Shared response types
│   │
│   ├── domain/
│   │   ├── aggregates/                   # Domain entities
│   │   │   ├── portfolio/
│   │   │   │   ├── portfolio.py         # Portfolio entity
│   │   │   │   ├── asset.py             # Asset entity
│   │   │   │   └── portfolio_valuation.py
│   │   │   ├── auth/
│   │   │   │   └── user.py              # User entity
│   │   │   ├── health/
│   │   │   │   └── health.py            # Health check entity
│   │   │   └── exceptions/
│   │   │       └── auth.py              # Auth exceptions
│   │   │
│   │   └── usecases/                     # Business logic
│   │       ├── usecases.py              # Abstract base classes
│   │       ├── authmgt/
│   │       │   └── authmgt.py           # Auth use cases
│   │       └── portfoliomgt/
│   │           ├── portfoliomgt.py       # Portfolio use cases
│   │           └── payloads.py          # Use case data models
│   │
│   └── infrastructure/
│       ├── cmd/                          # CLI and startup commands
│       │   ├── api.py                   # API server startup
│       │   └── cli.py                   # CLI interface
│       │
│       ├── config/
│       │   └── settings.py              # Pydantic Settings (env vars)
│       │
│       ├── dataservice/                 # Data access abstraction
│       │   ├── dbdataservice.py         # DB service interface
│       │   ├── authdataservice.py       # Auth service interface
│       │   ├── dbdataservice_builder.py # Factory for DB services
│       │   ├── authdataservice_builder.py
│       │   ├── db_sqlalchemy/
│       │   │   └── sqlalchemy.py        # SQLAlchemy implementation
│       │   ├── auth_local/
│       │   │   └── local.py             # Local auth (JWT + Argon2)
│       │   └── auth_supabase/
│       │       └── supabase.py          # Supabase auth integration
│       │
│       ├── datastore/                   # Database models
│       │   └── sqlalchemy/
│       │       ├── base.py              # SQLAlchemy Base
│       │       └── models/
│       │           ├── user.py          # User table
│       │           ├── portfolio.py      # Portfolio table
│       │           └── asset.py         # Asset table
│       │
│       └── utils/
│           └── pagination.py            # Pagination utilities
│
├── tests/
│   ├── unit/                            # Unit tests (fast, no DB)
│   │   ├── test_uc_portfoliomgt.py     # Portfolio use case tests
│   │   ├── test_uc_authmgt.py          # Auth use case tests
│   │   └── test_settings.py            # Settings validation tests
│   │
│   ├── integration/                     # Integration tests (with DB)
│   │   ├── dataservice_db/
│   │   │   └── test_sqlalchemy.py      # DB layer tests
│   │   ├── dataservice_auth/
│   │   │   ├── test_local.py           # Local auth tests
│   │   │   └── test_supabase.py        # Supabase auth tests
│   │   └── api_rest/
│   │       └── test_rest.py            # REST API endpoint tests
│   │
│   └── conftest.py                      # Pytest fixtures
│
├── requirements.txt                      # Python dependencies
├── pytest.ini                           # Pytest configuration
├── .pep8                                # Code style config
└── README.md                            # This file
```

---

## Tech Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | FastAPI | 0.128.0 | Async REST API framework with OpenAPI support |
| **ORM** | SQLAlchemy | 2.0.36 | Database ORM with async support |
| **Database Driver** | asyncpg | 0.30.0 | Fast async PostgreSQL driver |
| **Validation** | Pydantic | 2.10.3 | Data validation and settings management |
| **Settings** | pydantic-settings | 2.6.1 | Environment variable management |
| **JWT** | python-jose | 3.5.0 | JWT token generation/verification |
| **Password Hashing** | argon2-cffi | 25.1.0 | Secure password hashing (OWASP recommended) |
| **HTTP Client** | httpx | 0.28.1 | Async HTTP client for external APIs |
| **Caching** | cachetools | 5.5.0 | In-memory caching utilities |
| **Testing** | pytest | 8.3.4 | Test framework |
| **Async Testing** | pytest-asyncio | 0.24.0 | Async test support |
| **Mocking** | pytest-mock | 3.14.0 | Test mocking utilities |

---

## Getting Started

### Prerequisites

- **Python** 3.11 or higher
- **PostgreSQL** 15+
- **pip** (comes with Python)
- **virtualenv** or **venv** (recommended)

### Installation

#### 1. Create Virtual Environment

```bash
# Navigate to backend/python directory
cd backend/python

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

#### 2. Install Dependencies

First, install the dependencies with `pip install -r requirements.txt`.

#### 3. Set Up Database

```bash
# Create PostgreSQL database
createdb portfolio_db

# Or using psql
psql -U postgres -c "CREATE DATABASE portfolio_db;"
```

#### 4. Configure Environment

Copy the example environment file and configure it:

```bash
# From project root
cp backend/.env backend/.env.local

# Edit backend/.env.local with your settings
```

See [Configuration](#configuration) section for details.

---

## Configuration

### Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the `backend/` directory:

```bash
# App Configuration
APP_NAME=Simple Portfolio App API
APP_ENV=dev                           # dev | staging | production
APP_DEBUG=false                       # Enable debug mode

# Database Configuration (REQUIRED)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio_db
DB_USER=postgres
DB_PASSWORD=changeme
DB_SSLMODE=disable                    # disable | allow | prefer | require

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Authentication Configuration
AUTH_MODE=local                       # local | supabase
JWT_SECRET=your-secret-key-here       # Required for local auth (min 32 chars)
JWT_EXPIRES_MINUTES=60                # Token expiration time

# Cookie Configuration
COOKIE_SECURE=false                   # Set to true in production (HTTPS)
COOKIE_SAMESITE=lax                   # lax | strict | none
COOKIE_DOMAIN=localhost               # Cookie domain

# Supabase Configuration (only if AUTH_MODE=supabase)
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
```

### Custom Environment File Location

To specify a custom environment file location, you can use the `ENV_FILE` environment variable:

```bash
ENV_FILE=path/to/your/.env fastapi dev src/main.py
```

Or:

```bash
ENV_FILE=/path/to/your/.env python -m src.infrastructure.cmd.api
```

### Configuration Validation

The application validates all configuration on startup using Pydantic. Invalid configuration will raise clear error messages:

- Database credentials must be provided
- JWT_SECRET required when using local auth
- Supabase credentials required when using Supabase auth
- Port must be between 1-65535
- SSL mode must be valid

---

## Running the Application

### Development Server

#### Option 1: Using FastAPI CLI (Recommended for Development)

To run the server, use `fastapi dev src/main.py`.

This starts the server with:
- Auto-reload on code changes
- Interactive API docs at http://localhost:8000/docs
- Alternative docs at http://localhost:8000/redoc

#### Option 2: Using Python Module

```bash
python -m src.infrastructure.cmd.api
```

#### Option 3: Direct Python Script

```bash
# Create a simple startup script
cat > run.py << 'EOF'
import uvicorn
from src.api.rest.app import create_app

if __name__ == "__main__":
    app = create_app()
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

python run.py
```

### Production Server

For production, use Uvicorn with multiple workers:

```bash
uvicorn src.api.rest.app:create_app --host 0.0.0.0 --port 8000 --workers 4
```

Or with Gunicorn + Uvicorn workers:

```bash
gunicorn src.api.rest.app:create_app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000
```

### Verify Installation

Once the server is running, visit:

- **API Root**: http://localhost:8000/
- **Interactive Docs (Swagger UI)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json
- **Health Check**: http://localhost:8000/health

---

## Testing

### Running Tests

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage report
pytest --cov=src --cov-report=html --cov-report=term

# View HTML coverage report
open htmlcov/index.html  # On Mac
xdg-open htmlcov/index.html  # On Linux
```

### Test Categories

```bash
# Run only unit tests (fast, no external dependencies)
pytest -m unit

# Run only integration tests (requires database)
pytest -m integration

# Run specific test file
pytest tests/unit/test_uc_portfoliomgt.py

# Run specific test function
pytest tests/unit/test_uc_portfoliomgt.py::test_create_portfolio
```

### Test Structure

- **Unit Tests** (`tests/unit/`): Test business logic in isolation
  - No database connections
  - Mock external dependencies
  - Fast execution (< 1 second)

- **Integration Tests** (`tests/integration/`): Test with real dependencies
  - Database operations
  - API endpoints
  - Auth providers
  - Slower execution (1-5 seconds per test)

### Test Configuration

Test settings are defined in `pytest.ini`:

```ini
[pytest]
asyncio_mode = auto              # Automatically detect async tests
testpaths = tests                # Test discovery path
python_files = test_*.py         # Test file pattern
python_classes = Test*           # Test class pattern
python_functions = test_*        # Test function pattern
markers =
    unit: Unit tests (fast, no database)
    integration: Integration tests (require external dependencies)
```

### Writing Tests

#### Unit Test Example

```python
import pytest
from src.domain.usecases.portfoliomgt.portfoliomgt import PortfolioMgt
from src.domain.aggregates.portfolio.portfolio import Portfolio

@pytest.mark.unit
async def test_create_portfolio(mock_db_service, mock_auth_service):
    use_case = PortfolioMgt(mock_db_service, mock_auth_service)

    portfolio = await use_case.create_portfolio(
        user_id="user-123",
        name="My Portfolio"
    )

    assert portfolio.name == "My Portfolio"
    assert portfolio.owner_id == "user-123"
```

#### Integration Test Example

```python
import pytest
from httpx import AsyncClient
from src.api.rest.app import create_app

@pytest.mark.integration
async def test_register_user(async_client: AsyncClient):
    response = await async_client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "SecurePass123!"}
    )

    assert response.status_code == 201
    assert "user" in response.json()
```

### Current Test Coverage

- **Overall Coverage**: 80%+
- **Domain Layer**: 90%+ (use cases, entities)
- **API Layer**: 85%+ (routers, schemas)
- **Infrastructure Layer**: 75%+ (data services, models)

---

## API Endpoints

### Base URL

```
http://localhost:8000
```

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Auth Required |
|--------|----------|-------------|--------------|---------------|
| POST | `/auth/register` | Register new user | `{email, password}` | ❌ |
| POST | `/auth/login` | Login user | `{email, password}` | ❌ |
| POST | `/auth/logout` | Logout user | - | ✅ |
| GET | `/auth/me` | Get current user | - | ✅ |

### Portfolio Endpoints

| Method | Endpoint | Description | Request Body | Auth Required |
|--------|----------|-------------|--------------|---------------|
| POST | `/portfolios` | Create portfolio | `{name}` | ✅ |
| GET | `/portfolios` | List portfolios (paginated) | Query: `page`, `items_per_page` | ✅ |
| GET | `/portfolios/{id}` | Get portfolio by ID | - | ✅ |
| PATCH | `/portfolios/{id}` | Update portfolio | `{name}` | ✅ |
| DELETE | `/portfolios/{id}` | Delete portfolio | - | ✅ |
| GET | `/portfolios/{id}/valuation` | Get portfolio valuation | - | ✅ |

### Asset Endpoints

| Method | Endpoint | Description | Request Body | Auth Required |
|--------|----------|-------------|--------------|---------------|
| POST | `/portfolios/{id}/assets` | Add asset | `{symbol, quantity}` | ✅ |
| GET | `/portfolios/{id}/assets` | List assets (paginated) | Query: `page`, `items_per_page` | ✅ |
| DELETE | `/portfolios/{id}/assets/{asset_id}` | Delete asset | - | ✅ |
| GET | `/prices` | Get current prices | - | ✅ |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | ❌ |

### Interactive Documentation

For detailed request/response schemas and to try out the API:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Development

### Code Style

This project follows PEP 8 Python style guidelines :

```bash
# Install black
pip install black

# Run linting
black **/*.py
```

### Project Conventions

- **Async/Await**: All I/O operations are async
- **Type Hints**: Use type hints for all function signatures
- **Docstrings**: Document complex functions and classes
- **Error Handling**: Raise domain exceptions, handle in API layer
- **Naming**:
  - Classes: `PascalCase`
  - Functions/Variables: `snake_case`
  - Constants: `UPPER_SNAKE_CASE`

### Adding New Features

#### 1. Define Domain Entity (if needed)

```python
# src/domain/aggregates/your_feature/entity.py
from dataclasses import dataclass
from datetime import datetime

@dataclass
class YourEntity:
    id: int
    name: str
    created_at: datetime
```

#### 2. Create Use Case

```python
# src/domain/usecases/your_feature/use_case.py
class YourFeatureUseCase:
    def __init__(self, db_service, auth_service):
        self.db = db_service
        self.auth = auth_service

    async def do_something(self, data):
        # Business logic here
        pass
```

#### 3. Add Database Model

```python
# src/infrastructure/datastore/sqlalchemy/models/your_model.py
from sqlalchemy import Column, Integer, String
from ..base import Base

class YourModel(Base):
    __tablename__ = "your_table"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
```

#### 4. Create API Schema

```python
# src/api/rest/schemas/your_schema.py
from pydantic import BaseModel

class YourRequest(BaseModel):
    name: str

class YourResponse(BaseModel):
    id: int
    name: str
```

#### 5. Add API Router

```python
# src/api/rest/routers/your_router.py
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/your-endpoint", tags=["your-feature"])

@router.post("/")
async def create_resource(request: YourRequest):
    # Handler logic
    pass
```

#### 6. Write Tests

```python
# tests/unit/test_your_feature.py
import pytest

@pytest.mark.unit
async def test_your_feature():
    # Test implementation
    pass
```

---

## Deployment

This Python backend is designed to be deployed using **Kubernetes (K3s)** as part of the polyglot deployment showcase.

### Docker

```bash
# Build Docker image
docker build -t simple-portfolio-api:python .

# Run container
docker run -p 8000:8000 \
    -e DB_HOST=host.docker.internal \
    -e DB_PASSWORD=changeme \
    simple-portfolio-api:python
```

### Kubernetes

See the main [DEPLOYMENT.md](../../DEPLOYMENT.md) for detailed Kubernetes deployment instructions.

### Production Checklist

- [ ] Set `COOKIE_SECURE=true` (requires HTTPS)
- [ ] Set `DB_SSLMODE=require` for encrypted database connections
- [ ] Use strong `JWT_SECRET` (32+ random characters)
- [ ] Configure proper `CORS_ORIGINS` whitelist
- [ ] Set `APP_ENV=production`
- [ ] Enable database connection pooling
- [ ] Set up monitoring and logging
- [ ] Configure health checks
- [ ] Use multiple Uvicorn workers
- [ ] Set up database backups

---


## Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **SQLAlchemy 2.0 Documentation**: https://docs.sqlalchemy.org/en/20/
- **Pydantic Documentation**: https://docs.pydantic.dev/
- **Pytest Documentation**: https://docs.pytest.org/

---

## License

This project is part of Simple Portfolio App and is licensed under the MIT License. See [LICENSE](../../LICENSE) for details.

---

<div align="center">

**Built with ❤️ using FastAPI and Clean Architecture**

</div>