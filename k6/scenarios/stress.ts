/**
 * Stress Test Scenario
 *
 * Gradually increases load beyond normal levels to find breaking points.
 * Identifies performance degradation thresholds.
 *
 * Configuration:
 * - Ramp up to 150 Virtual Users
 * - 8 minutes total duration
 * - Relaxed thresholds (5% error rate allowed)
 *
 * Stages:
 * - 2 min: Ramp to 50 VUs (baseline)
 * - 2 min: Ramp to 100 VUs (high load)
 * - 2 min: Ramp to 150 VUs (stress)
 * - 2 min: Ramp down to 0
 *
 * Usage:
 *   npm run build && k6 run dist/scenarios/stress.js
 *   BASE_URL=http://api.example.com k6 run dist/scenarios/stress.js
 */

import { sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { Options } from 'k6/options';
import { RefinedResponse, ResponseType } from 'k6/http';

import { BASE_URL, stressThresholds } from '../config';
import { generatePassword, generateVuEmail } from '../utils/data';
import { setupTestUser, cleanupTestUser } from '../utils/auth';
import { createPortfolio, listPortfolios, getPortfolioValuation, deletePortfolio } from '../tests/portfolios';
import { addAsset, getPrices } from '../tests/assets';

type HttpResponse = RefinedResponse<ResponseType | undefined>;

// Custom metrics for stress analysis
const requestsUnderLoad = new Counter('requests_under_load');
const errorsUnderLoad = new Counter('errors_under_load');
const stressSuccessRate = new Rate('stress_success_rate');
const responseTimeUnderStress = new Trend('response_time_under_stress', true);

export const options: Options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp to baseline
    { duration: '2m', target: 100 },  // Ramp to high load
    { duration: '2m', target: 150 },  // Ramp to stress level
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    ...stressThresholds,
    checks: ['rate>0.90'],
    stress_success_rate: ['rate>0.90'],
    response_time_under_stress: ['p(95)<2000'],
  },
  tags: {
    scenario: 'stress',
  },
};

interface SetupData {
  startTime: number;
}

export function setup(): SetupData {
  console.log('Stress test starting...');
  console.log(`Target URL: ${BASE_URL}`);
  console.log('This test will push the system beyond normal operating conditions.');
  return { startTime: Date.now() };
}

export default function (_data: SetupData): void {
  const vuEmail = generateVuEmail(__VU, __ITER);
  const vuPassword = generatePassword();

  const currentVUs = __VU;
  const loadLevel = currentVUs <= 50 ? 'baseline' : currentVUs <= 100 ? 'high' : 'stress';

  group(`Stress Test - ${loadLevel}`, () => {
    setupTestUser(vuEmail, vuPassword);
    sleep(0.5);

    const operations: Array<{ name: string; fn: () => HttpResponse }> = [
      { name: 'list_portfolios', fn: () => listPortfolios() },
      { name: 'create_portfolio', fn: () => createPortfolio() },
      { name: 'get_prices', fn: () => getPrices() },
    ];

    let portfolioId: number | null = null;

    for (const op of operations) {
      const startTime = Date.now();
      const response = op.fn();
      const duration = Date.now() - startTime;

      requestsUnderLoad.add(1);
      responseTimeUnderStress.add(duration);

      const success = response.status >= 200 && response.status < 400;
      if (success) {
        stressSuccessRate.add(1);
        if (op.name === 'create_portfolio') {
          portfolioId = (response.json() as Record<string, number> | null)?.id ?? null;
        }
      } else {
        errorsUnderLoad.add(1);
        stressSuccessRate.add(0);
      }

      sleep(randomBetween(0.2, 0.5));
    }

    if (portfolioId) {
      for (let i = 0; i < 3; i++) {
        const assetRes = addAsset(portfolioId);
        trackResponse(assetRes);
        sleep(0.1);
      }

      for (let i = 0; i < 2; i++) {
        const startTime = Date.now();
        const valuationRes = getPortfolioValuation(portfolioId);
        const duration = Date.now() - startTime;

        responseTimeUnderStress.add(duration);
        trackResponse(valuationRes);
        sleep(0.2);
      }

      deletePortfolio(portfolioId);
    }

    cleanupTestUser();
  });

  sleep(randomBetween(0.5, 1.5));
}

export function teardown(data: SetupData): void {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`\nStress test completed in ${duration.toFixed(2)} seconds`);
  console.log('Review metrics to identify performance degradation points.');
}

function trackResponse(response: HttpResponse): void {
  requestsUnderLoad.add(1);
  const success = response.status >= 200 && response.status < 400;
  if (success) {
    stressSuccessRate.add(1);
  } else {
    errorsUnderLoad.add(1);
    stressSuccessRate.add(0);
  }
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
