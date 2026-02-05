/**
 * Smoke Test Scenario
 *
 * Quick validation that all endpoints respond correctly.
 * Run before deployments to catch obvious issues.
 *
 * Configuration:
 * - 1 Virtual User
 * - 30 seconds duration
 * - Strict thresholds (no errors allowed)
 *
 * Usage:
 *   npm run build && k6 run dist/scenarios/smoke.js
 *   BASE_URL=http://api.example.com k6 run dist/scenarios/smoke.js
 */

import { sleep } from 'k6';
import http from 'k6/http';
import { check } from 'k6';
import { Options } from 'k6/options';

import { BASE_URL, endpoints, defaultThresholds } from '../config';
import { testRegister, testLogin, testMe, testLogout } from '../tests/auth';
import { createPortfolio, listPortfolios, getPortfolio, getPortfolioValuation, deletePortfolio } from '../tests/portfolios';
import { addAsset, listAssets, getPrices, deleteAsset } from '../tests/assets';

export const options: Options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    ...defaultThresholds,
    checks: ['rate>0.95'],
  },
  tags: {
    scenario: 'smoke',
  },
};

export default function (): void {
  // Health check
  const healthRes = http.get(`${BASE_URL}${endpoints.health}`, {
    tags: { name: 'GET /health' },
  });
  check(healthRes, {
    'health: status is 200': (r) => r.status === 200,
  });
  sleep(0.5);

  // Auth flow
  const { email, password } = testRegister();
  sleep(0.5);

  testLogin(email, password);
  sleep(0.5);

  testMe();
  sleep(0.5);

  // Portfolio operations
  const portfolioRes = createPortfolio();
  const portfolioId = (portfolioRes.json() as Record<string, number> | null)?.id;
  sleep(0.5);

  if (portfolioId) {
    listPortfolios();
    sleep(0.5);

    getPortfolio(portfolioId);
    sleep(0.5);

    // Asset operations
    getPrices();
    sleep(0.5);

    const assetRes = addAsset(portfolioId);
    const assetId = (assetRes.json() as Record<string, number> | null)?.id;
    sleep(0.5);

    if (assetId) {
      listAssets(portfolioId);
      sleep(0.5);

      // Valuation (key endpoint)
      getPortfolioValuation(portfolioId);
      sleep(0.5);

      deleteAsset(portfolioId, assetId);
      sleep(0.5);
    }

    deletePortfolio(portfolioId);
    sleep(0.5);
  }

  // Logout
  testLogout();
  sleep(1);
}

interface MetricValues {
  avg: number;
  'p(95)': number;
  'p(99)': number;
  rate: number;
  passes: number;
  count: number;
}

interface SummaryData {
  metrics: Record<string, { values: MetricValues }>;
  root_group: unknown;
}

export function handleSummary(data: SummaryData): Record<string, string> {
  return {
    stdout: textSummary(data),
  };
}

function textSummary(data: SummaryData): string {
  const { metrics } = data;
  let output = '\n=== SMOKE TEST SUMMARY ===\n\n';

  const checks = metrics.checks;
  const httpFailed = metrics.http_req_failed;

  if (checks && checks.values.passes === checks.values.count && httpFailed && httpFailed.values.rate === 0) {
    output += '✅ SMOKE TEST PASSED\n\n';
  } else {
    output += '❌ SMOKE TEST FAILED\n\n';
  }

  if (metrics.http_req_duration) {
    const duration = metrics.http_req_duration.values;
    output += `Response Times:\n`;
    output += `  avg: ${duration.avg.toFixed(2)}ms\n`;
    output += `  p(95): ${duration['p(95)'].toFixed(2)}ms\n`;
    output += `  p(99): ${duration['p(99)'].toFixed(2)}ms\n\n`;
  }

  if (checks) {
    output += `Checks: ${checks.values.passes}/${checks.values.count} passed\n`;
  }

  if (httpFailed) {
    output += `Error rate: ${(httpFailed.values.rate * 100).toFixed(2)}%\n`;
  }

  return output;
}
