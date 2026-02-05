/**
 * Spike Test Scenario
 *
 * Tests system behavior during sudden traffic bursts.
 * Verifies system can handle and recover from traffic spikes.
 *
 * Configuration:
 * - Sudden spike to 200 Virtual Users
 * - 2.5 minutes total duration
 * - Tests both burst handling and recovery
 *
 * Stages:
 * - 30s: Warm up with 10 VUs
 * - 1m: Sudden spike to 200 VUs
 * - 30s: Maintain spike
 * - 30s: Return to 10 VUs (recovery)
 *
 * Usage:
 *   npm run build && k6 run dist/scenarios/spike.js
 *   BASE_URL=http://api.example.com k6 run dist/scenarios/spike.js
 */

import { sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { Options } from 'k6/options';
import { RefinedResponse, ResponseType } from 'k6/http';

import { BASE_URL, stressThresholds } from '../config';
import { generateVuEmail, generatePassword } from '../utils/data';
import { setupTestUser, cleanupTestUser } from '../utils/auth';
import { createPortfolio, listPortfolios, getPortfolioValuation, deletePortfolio } from '../tests/portfolios';
import { addAsset } from '../tests/assets';

type HttpResponse = RefinedResponse<ResponseType | undefined>;
type Phase = 'warmup' | 'spike' | 'recovery';

// Custom metrics for spike analysis
const requestsDuringSpike = new Counter('requests_during_spike');
const errorsDuringSpike = new Counter('errors_during_spike');
const spikeSuccessRate = new Rate('spike_success_rate');
const responseTimeDuringSpike = new Trend('response_time_during_spike', true);
const recoveryResponseTime = new Trend('recovery_response_time', true);

export const options: Options = {
  stages: [
    { duration: '30s', target: 10 },   // Warm up
    { duration: '10s', target: 200 },  // Spike!
    { duration: '50s', target: 200 },  // Maintain spike
    { duration: '30s', target: 10 },   // Recovery
    { duration: '30s', target: 10 },   // Stabilize
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<3000'],
    checks: ['rate>0.85'],
    spike_success_rate: ['rate>0.85'],
  },
  tags: {
    scenario: 'spike',
  },
};

// Track which phase we're in
let phase: Phase = 'warmup';

interface SetupData {
  startTime: number;
}

export function setup(): SetupData {
  console.log('Spike test starting...');
  console.log(`Target URL: ${BASE_URL}`);
  console.log('This test simulates a sudden traffic spike.');
  return { startTime: Date.now() };
}

export default function (data: SetupData): void {
  const vuEmail = generateVuEmail(__VU, __ITER);
  const vuPassword = generatePassword();

  const elapsed = (Date.now() - data.startTime) / 1000;
  if (elapsed < 30) {
    phase = 'warmup';
  } else if (elapsed < 90) {
    phase = 'spike';
  } else {
    phase = 'recovery';
  }

  group(`Spike Test - ${phase}`, () => {
    setupTestUser(vuEmail, vuPassword);

    const iterations = phase === 'spike' ? 3 : 2;

    for (let i = 0; i < iterations; i++) {
      measureOperation(() => listPortfolios(), phase);
      sleep(0.1);

      const createRes = measureOperation(() => createPortfolio(), phase);
      const portfolioId = (createRes.json() as Record<string, number> | null)?.id;

      if (portfolioId) {
        measureOperation(() => addAsset(portfolioId), phase);
        measureOperation(() => getPortfolioValuation(portfolioId), phase);
        deletePortfolio(portfolioId);
      }

      sleep(0.1);
    }

    cleanupTestUser();
  });

  const pauseDuration = phase === 'spike' ? 0.2 : phase === 'recovery' ? 1 : 0.5;
  sleep(pauseDuration);
}

export function teardown(data: SetupData): void {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`\nSpike test completed in ${duration.toFixed(2)} seconds`);
  console.log('Analyze recovery_response_time to verify system recovered from spike.');
}

function measureOperation(fn: () => HttpResponse, currentPhase: Phase): HttpResponse {
  const startTime = Date.now();
  const response = fn();
  const duration = Date.now() - startTime;

  requestsDuringSpike.add(1);
  responseTimeDuringSpike.add(duration);

  if (currentPhase === 'recovery') {
    recoveryResponseTime.add(duration);
  }

  const success = response.status >= 200 && response.status < 400;
  if (success) {
    spikeSuccessRate.add(1);
  } else {
    errorsDuringSpike.add(1);
    spikeSuccessRate.add(0);
  }

  return response;
}

interface MetricValues {
  avg: number;
  'p(95)': number;
  'p(99)': number;
  rate: number;
}

interface SummaryData {
  metrics: Record<string, { values: MetricValues }>;
}

export function handleSummary(data: SummaryData): Record<string, string> {
  const { metrics } = data;
  let output = '\n=== SPIKE TEST SUMMARY ===\n\n';

  if (metrics.response_time_during_spike) {
    const spike = metrics.response_time_during_spike.values;
    output += `Response Times During Spike:\n`;
    output += `  avg: ${spike.avg.toFixed(2)}ms\n`;
    output += `  p(95): ${spike['p(95)'].toFixed(2)}ms\n`;
    output += `  p(99): ${spike['p(99)'].toFixed(2)}ms\n\n`;
  }

  if (metrics.recovery_response_time) {
    const recovery = metrics.recovery_response_time.values;
    output += `Response Times During Recovery:\n`;
    output += `  avg: ${recovery.avg.toFixed(2)}ms\n`;
    output += `  p(95): ${recovery['p(95)'].toFixed(2)}ms\n`;
    output += `  p(99): ${recovery['p(99)'].toFixed(2)}ms\n\n`;
  }

  if (metrics.spike_success_rate) {
    const successRate = metrics.spike_success_rate.values.rate * 100;
    output += `Success Rate: ${successRate.toFixed(2)}%\n`;
  }

  if (metrics.recovery_response_time && metrics.response_time_during_spike) {
    const spikeP95 = metrics.response_time_during_spike.values['p(95)'];
    const recoveryP95 = metrics.recovery_response_time.values['p(95)'];

    if (recoveryP95 < spikeP95 * 0.5) {
      output += '\n✅ System recovered well from spike\n';
    } else if (recoveryP95 < spikeP95) {
      output += '\n⚠️ System partially recovered from spike\n';
    } else {
      output += '\n❌ System did not recover from spike\n';
    }
  }

  return {
    stdout: output,
  };
}
