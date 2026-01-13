# Tests

This directory contains unit and integration tests for the Python backend.

## Structure

- `unit/` - Unit tests that test individual components in isolation (no database required)
- `integration/` - Integration tests that test the full API with a test database
- `conftest.py` - Shared pytest fixtures for all tests

## Running Tests

### Run all tests
```bash
pytest
```

### Run only unit tests
```bash
pytest tests/unit -m unit
```

### Run only integration tests
```bash
pytest tests/integration -m integration
```

### Run with verbose output
```bash
pytest -v
```

### Run specific test file
```bash
pytest tests/integration/test_portfolios.py
```

### Run specific test
```bash
pytest tests/integration/test_portfolios.py::TestPortfolioEndpoints::test_create_portfolio
```

## Test Database

By default, tests use an in-memory SQLite database for speed. Each test gets a fresh database that is created and destroyed automatically.

To use a different test database (e.g., PostgreSQL), set the `TEST_DATABASE_URL` environment variable:

```bash
TEST_DATABASE_URL=postgresql+asyncpg://user:pass@localhost/testdb pytest
```

## Test Markers

Tests are marked with:
- `@pytest.mark.unit` - Unit tests (fast, no database)
- `@pytest.mark.integration` - Integration tests (require database)
- `@pytest.mark.slow` - Slow running tests

You can run tests by marker:
```bash
pytest -m unit  # Only unit tests
pytest -m "not slow"  # Skip slow tests
```

