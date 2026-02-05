# k6 Load Testing

Performance and load testing suite for the Simple Portfolio Management API using [k6](https://k6.io/).

## Overview

This directory contains load testing scenarios that work across all backend implementations (Python, Go, Node.js, Java, PHP).

## Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/) installed locally
- Backend API running (any implementation)
- PostgreSQL database with migrations applied

### Install k6

```bash
# macOS
brew install k6

# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# Windows
choco install k6

# Docker
docker pull grafana/k6
```

## Directory Structure

```
k6/
├── config.js                 # Shared configuration (URLs, thresholds)
├── scenarios/
│   ├── smoke.js              # Quick validation (1 VU, 30s)
│   ├── load.js               # Normal load (50 VUs, 5min)
│   ├── stress.js             # Stress test (150 VUs, 8min)
│   └── spike.js              # Traffic spike (200 VUs burst)
├── tests/
│   ├── auth.js               # Auth endpoint tests
│   ├── portfolios.js         # Portfolio CRUD tests
│   └── assets.js             # Asset CRUD tests
├── utils/
│   ├── auth.js               # Authentication helpers
│   └── data.js               # Test data generators
├── dashboards/
│   └── k6-dashboard.json     # Grafana dashboard
└── README.md
```

## Quick Start

### 1. Start the backend

```bash
# Python backend
cd backend/python
python -m uvicorn src.infrastructure.cmd.api:app --port 8000
```

### 2. Run a smoke test

```bash
cd k6
k6 run scenarios/smoke.js
```

### 3. Run against a different URL

```bash
BASE_URL=http://api.example.com k6 run scenarios/smoke.js
```

## Test Scenarios

### Smoke Test
Quick validation that all endpoints are responding correctly.

```bash
k6 run scenarios/smoke.js
```

- **VUs**: 1
- **Duration**: 30 seconds
- **Use case**: Pre-deployment validation, CI/CD gates

### Load Test
Simulates normal production traffic patterns.

```bash
k6 run scenarios/load.js
```

- **VUs**: Ramp to 50
- **Duration**: 5 minutes
- **Stages**: Ramp up → Sustained load → Ramp down
- **Use case**: Baseline performance measurement

### Stress Test
Pushes the system beyond normal capacity to find breaking points.

```bash
k6 run scenarios/stress.js
```

- **VUs**: Ramp to 150
- **Duration**: 8 minutes
- **Stages**: 50 → 100 → 150 → 0
- **Use case**: Capacity planning, finding bottlenecks

### Spike Test
Tests system behavior during sudden traffic bursts.

```bash
k6 run scenarios/spike.js
```

- **VUs**: Burst to 200
- **Duration**: 2.5 minutes
- **Use case**: Testing auto-scaling, recovery behavior

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:8000` | Target API URL |
| `K6_PROMETHEUS_RW_SERVER_URL` | - | Prometheus Remote Write URL |

### Thresholds

Default performance SLAs:

| Metric | Smoke/Load | Stress |
|--------|------------|--------|
| p(95) response time | < 500ms | < 1000ms |
| p(99) response time | < 1000ms | < 2000ms |
| Error rate | < 1% | < 5% |

## Prometheus/Grafana Integration

### Output to Prometheus

```bash
K6_PROMETHEUS_RW_SERVER_URL=http://prometheus:9090/api/v1/write \
k6 run --out experimental-prometheus-rw scenarios/load.js
```

### Import Grafana Dashboard

1. Open Grafana
2. Go to Dashboards → Import
3. Upload `dashboards/k6-dashboard.json`
4. Select your Prometheus data source
5. Click Import

### Key Metrics in Grafana

- `k6_http_reqs_total` - Total requests
- `k6_http_req_duration_*` - Response time histogram
- `k6_http_req_failed_total` - Failed requests
- `k6_vus` - Active virtual users
- `k6_iterations_total` - Completed iterations

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/k6-load-tests.yaml`) provides:

- **Manual trigger**: Run any scenario on-demand
- **Automatic smoke tests**: On push to main
- **PR comments**: Performance summary posted to PRs
- **Artifacts**: Test results stored for 30 days

### Trigger manually

```bash
gh workflow run k6-load-tests.yaml -f scenario=load
```

### Configure Prometheus in CI

Add `PROMETHEUS_REMOTE_WRITE_URL` to your repository secrets for real-time metrics during CI runs.

## Writing New Tests

### Add a new endpoint test

```javascript
// tests/my-feature.js
import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, headers } from '../config.js';

export function testMyFeature() {
  const response = http.get(
    `${BASE_URL}/my-endpoint`,
    { headers, tags: { name: 'GET /my-endpoint' } }
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  return response;
}
```

### Add to a scenario

```javascript
// scenarios/smoke.js
import { testMyFeature } from '../tests/my-feature.js';

export default function () {
  // ... existing tests
  testMyFeature();
  sleep(0.5);
}
```

## Interpreting Results

### Console Output

```
     checks.........................: 100.00% ✓ 150  ✗ 0
     http_req_duration..............: avg=45.2ms  p(95)=89.3ms  p(99)=120.1ms
     http_req_failed................: 0.00%   ✓ 0    ✗ 300
     http_reqs......................: 300     10.0/s
     vus............................: 1       min=1  max=1
```

- **checks**: Percentage of assertions that passed
- **http_req_duration**: Response time statistics
- **http_req_failed**: Percentage of failed requests
- **http_reqs**: Total requests and rate

### JSON Output

```bash
k6 run --out json=results.json scenarios/smoke.js
```

Parse with:
```bash
cat results.json | jq 'select(.type=="Point" and .metric=="http_req_duration")'
```

## Troubleshooting

### "Connection refused" errors

Ensure the backend is running and accessible:
```bash
curl http://localhost:8000/health
```

### Authentication failures

Check that JWT_SECRET matches between your backend and test expectations.

### High error rates

- Check database connectivity
- Verify CORS settings allow test origin
- Review backend logs for errors

### Tests running slowly

- Reduce VU count for local testing
- Check database connection pool settings
- Ensure adequate resources for both backend and k6

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Examples](https://github.com/grafana/k6/tree/master/examples)
- [Prometheus Remote Write](https://k6.io/docs/results-output/real-time/prometheus-remote-write/)
- [Grafana k6 Integration](https://grafana.com/docs/k6/latest/)
