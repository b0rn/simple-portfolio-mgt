/**
 * k6 Load Testing Configuration
 * Shared configuration for all test scenarios
 */

// Base URL - configurable via environment variable
export const BASE_URL: string = __ENV.BASE_URL || 'http://localhost:8000';

// Common HTTP headers
export const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Default thresholds for performance SLAs
export const defaultThresholds: Record<string, string[]> = {
  http_req_failed: ['rate<0.01'],           // Error rate < 1%
  http_req_duration: ['p(95)<500'],         // 95th percentile < 500ms
};

// Extended thresholds for load tests
export const loadThresholds: Record<string, string[]> = {
  http_req_failed: ['rate<0.01'],           // Error rate < 1%
  http_req_duration: ['p(95)<500', 'p(99)<1000'], // p95 < 500ms, p99 < 1s
};

// Relaxed thresholds for stress tests
export const stressThresholds: Record<string, string[]> = {
  http_req_failed: ['rate<0.05'],           // Error rate < 5%
  http_req_duration: ['p(95)<1000', 'p(99)<2000'], // p95 < 1s, p99 < 2s
};

// API endpoints
export const endpoints = {
  // Auth
  register: '/auth/register',
  login: '/auth/login',
  logout: '/auth/logout',
  me: '/auth/me',

  // Portfolios
  portfolios: '/portfolios',
  portfolio: (id: number) => `/portfolios/${id}`,
  valuation: (id: number) => `/portfolios/${id}/valuation`,

  // Assets
  assets: (portfolioId: number) => `/portfolios/${portfolioId}/assets`,
  asset: (portfolioId: number, assetId: number) => `/portfolios/${portfolioId}/assets/${assetId}`,
  prices: '/prices',

  // Health
  health: '/health',
};

// Pagination defaults
export const pagination = {
  defaultPage: 1,
  defaultItemsPerPage: 20,
  maxItemsPerPage: 100,
};

// Test user credentials pattern
export const testUserPrefix = 'k6-test-';
