/**
 * Load Test Scenario
 *
 * Simulates normal production traffic patterns.
 * Tests system behavior under expected load.
 *
 * Configuration:
 * - Ramp up to 50 Virtual Users
 * - 5 minutes total duration
 * - Standard performance thresholds
 *
 * Stages:
 * - 1 min: Ramp up to 20 VUs
 * - 3 min: Sustained load at 50 VUs
 * - 1 min: Ramp down to 0
 *
 * Usage:
 *   npm run build && k6 run dist/scenarios/load.js
 *   BASE_URL=http://api.example.com k6 run dist/scenarios/load.js
 *
 * With Prometheus output:
 *   K6_PROMETHEUS_RW_SERVER_URL=http://prometheus:9090/api/v1/write \
 *   k6 run --out experimental-prometheus-rw dist/scenarios/load.js
 */

import { sleep, group } from 'k6';
import { Counter, Rate } from 'k6/metrics';
import { Options } from 'k6/options';

import { BASE_URL, loadThresholds } from '../config';
import { generatePassword, generateVuEmail } from '../utils/data';
import { setupTestUser, cleanupTestUser } from '../utils/auth';
import { listPortfolios, createPortfolio, getPortfolio, getPortfolioValuation, updatePortfolio, deletePortfolio } from '../tests/portfolios';
import { addAsset, listAssets, getPrices } from '../tests/assets';

// Custom metrics
const successfulOperations = new Counter('successful_operations');
const failedOperations = new Counter('failed_operations');
const operationSuccessRate = new Rate('operation_success_rate');

export const options: Options = {
  stages: [
    { duration: '1m', target: 20 },   // Ramp up
    { duration: '3m', target: 50 },   // Sustained load
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    ...loadThresholds,
    checks: ['rate>0.95'],
    operation_success_rate: ['rate>0.95'],
    portfolio_valuation_duration: ['p(95)<1000'],
    portfolio_create_duration: ['p(95)<500'],
    auth_login_duration: ['p(95)<500'],
  },
  tags: {
    scenario: 'load',
  },
};

interface SetupData {
  startTime: number;
}

export function setup(): SetupData {
  console.log('Load test starting...');
  console.log(`Target URL: ${BASE_URL}`);
  return { startTime: Date.now() };
}

export default function (data: SetupData): void {
  const vuEmail = generateVuEmail(__VU, __ITER);
  const vuPassword = generatePassword();

  group('Setup', () => {
    setupTestUser(vuEmail, vuPassword);
  });

  group('User Session', () => {
    const listRes = listPortfolios();
    recordOperation(listRes.status === 200);
    sleep(randomBetween(1, 3));

    const createRes = createPortfolio();
    recordOperation(createRes.status === 201);
    const portfolioId = (createRes.json() as Record<string, number> | null)?.id;
    sleep(randomBetween(0.5, 1.5));

    if (portfolioId) {
      const getRes = getPortfolio(portfolioId);
      recordOperation(getRes.status === 200);
      sleep(randomBetween(0.5, 1));

      for (let i = 0; i < randomBetween(1, 3); i++) {
        const assetRes = addAsset(portfolioId);
        recordOperation(assetRes.status === 201);
        sleep(randomBetween(0.3, 0.8));
      }

      const valuationRes = getPortfolioValuation(portfolioId);
      recordOperation(valuationRes.status === 200);
      sleep(randomBetween(1, 2));

      const pricesRes = getPrices();
      recordOperation(pricesRes.status === 200);
      sleep(randomBetween(0.5, 1));

      const listAssetsRes = listAssets(portfolioId);
      recordOperation(listAssetsRes.status === 200);
      sleep(randomBetween(0.5, 1));

      if (Math.random() < 0.3) {
        const updateRes = updatePortfolio(portfolioId);
        recordOperation(updateRes.status === 200);
        sleep(randomBetween(0.3, 0.8));
      }

      const valuationRes2 = getPortfolioValuation(portfolioId);
      recordOperation(valuationRes2.status === 200);
      sleep(randomBetween(0.5, 1));

      const deleteRes = deletePortfolio(portfolioId);
      recordOperation(deleteRes.status === 204);
    }
  });

  group('Cleanup', () => {
    cleanupTestUser();
  });

  sleep(randomBetween(2, 5));
}

export function teardown(data: SetupData): void {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration.toFixed(2)} seconds`);
}

function recordOperation(success: boolean): void {
  if (success) {
    successfulOperations.add(1);
    operationSuccessRate.add(1);
  } else {
    failedOperations.add(1);
    operationSuccessRate.add(0);
  }
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
