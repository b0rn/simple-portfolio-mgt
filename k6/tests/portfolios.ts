/**
 * Portfolio endpoint tests for k6 load testing
 * Tests: create, list, get, update, delete, valuation
 */

import http, { RefinedResponse, ResponseType } from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { BASE_URL, endpoints, headers, pagination } from '../config';
import { generatePortfolioName, generateEmail, generatePassword } from '../utils/data';
import { setupTestUser, cleanupTestUser } from '../utils/auth';

type HttpResponse = RefinedResponse<ResponseType | undefined>;

// Custom metrics for portfolio operations
export const createPortfolioDuration = new Trend('portfolio_create_duration', true);
export const listPortfoliosDuration = new Trend('portfolio_list_duration', true);
export const getPortfolioDuration = new Trend('portfolio_get_duration', true);
export const updatePortfolioDuration = new Trend('portfolio_update_duration', true);
export const deletePortfolioDuration = new Trend('portfolio_delete_duration', true);
export const valuationDuration = new Trend('portfolio_valuation_duration', true);
export const portfolioErrors = new Counter('portfolio_errors');

/** Create a new portfolio */
export function createPortfolio(name?: string): HttpResponse {
  const portfolioName = name || generatePortfolioName();

  const response = http.post(
    `${BASE_URL}${endpoints.portfolios}`,
    JSON.stringify({ name: portfolioName }),
    { headers, tags: { name: 'POST /portfolios' } }
  );

  createPortfolioDuration.add(response.timings.duration);

  const success = check(response, {
    'create portfolio: status is 201': (r) => r.status === 201,
    'create portfolio: has id': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return body.id !== undefined;
      } catch (e) {
        return false;
      }
    },
    'create portfolio: name matches': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return body.name === portfolioName;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    portfolioErrors.add(1);
  }

  return response;
}

/** List all portfolios with pagination */
export function listPortfolios(
  page: number = pagination.defaultPage,
  itemsPerPage: number = pagination.defaultItemsPerPage,
): HttpResponse {
  const response = http.get(
    `${BASE_URL}${endpoints.portfolios}?page=${page}&items_per_page=${itemsPerPage}`,
    { headers, tags: { name: 'GET /portfolios' } }
  );

  listPortfoliosDuration.add(response.timings.duration);

  const success = check(response, {
    'list portfolios: status is 200': (r) => r.status === 200,
    'list portfolios: has items array': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return Array.isArray(body.items);
      } catch (e) {
        return false;
      }
    },
    'list portfolios: has pagination': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return body.pagination_response !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    portfolioErrors.add(1);
  }

  return response;
}

/** Get a specific portfolio by ID */
export function getPortfolio(portfolioId: number): HttpResponse {
  const response = http.get(
    `${BASE_URL}${endpoints.portfolio(portfolioId)}`,
    { headers, tags: { name: 'GET /portfolios/{id}' } }
  );

  getPortfolioDuration.add(response.timings.duration);

  const success = check(response, {
    'get portfolio: status is 200': (r) => r.status === 200,
    'get portfolio: has id': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return body.id === portfolioId;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    portfolioErrors.add(1);
  }

  return response;
}

/** Update a portfolio */
export function updatePortfolio(portfolioId: number, newName?: string): HttpResponse {
  const name = newName || generatePortfolioName();

  const response = http.patch(
    `${BASE_URL}${endpoints.portfolio(portfolioId)}`,
    JSON.stringify({ name }),
    { headers, tags: { name: 'PATCH /portfolios/{id}' } }
  );

  updatePortfolioDuration.add(response.timings.duration);

  const success = check(response, {
    'update portfolio: status is 200': (r) => r.status === 200,
    'update portfolio: name updated': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return body.name === name;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    portfolioErrors.add(1);
  }

  return response;
}

/** Delete a portfolio */
export function deletePortfolio(portfolioId: number): HttpResponse {
  const response = http.del(
    `${BASE_URL}${endpoints.portfolio(portfolioId)}`,
    null,
    { headers, tags: { name: 'DELETE /portfolios/{id}' } }
  );

  deletePortfolioDuration.add(response.timings.duration);

  const success = check(response, {
    'delete portfolio: status is 204': (r) => r.status === 204,
  });

  if (!success) {
    portfolioErrors.add(1);
  }

  return response;
}

/** Get portfolio valuation (high priority endpoint) */
export function getPortfolioValuation(portfolioId: number): HttpResponse {
  const response = http.get(
    `${BASE_URL}${endpoints.valuation(portfolioId)}`,
    { headers, tags: { name: 'GET /portfolios/{id}/valuation' } }
  );

  valuationDuration.add(response.timings.duration);

  const success = check(response, {
    'valuation: status is 200': (r) => r.status === 200,
    'valuation: has portfolio_id': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return body.portfolio_id === portfolioId;
      } catch (e) {
        return false;
      }
    },
    'valuation: has total_value': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return body.total_value !== undefined;
      } catch (e) {
        return false;
      }
    },
    'valuation: has lines array': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return Array.isArray(body.lines);
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    portfolioErrors.add(1);
  }

  return response;
}

/** Test portfolio not found */
export function testPortfolioNotFound(invalidId = 999999): HttpResponse {
  const response = http.get(
    `${BASE_URL}${endpoints.portfolio(invalidId)}`,
    { headers, tags: { name: 'GET /portfolios/{id} (not found)' } }
  );

  check(response, {
    'portfolio not found: status is 404': (r) => r.status === 404,
  });

  return response;
}

/** Full portfolio CRUD flow test */
export function testFullPortfolioFlow(): number | undefined {
  return group('Full Portfolio Flow', () => {
    const createRes = createPortfolio();
    const portfolioId = (createRes.json() as Record<string, number>).id;
    sleep(0.3);

    listPortfolios();
    sleep(0.3);

    getPortfolio(portfolioId);
    sleep(0.3);

    updatePortfolio(portfolioId);
    sleep(0.3);

    getPortfolioValuation(portfolioId);
    sleep(0.3);

    deletePortfolio(portfolioId);

    return portfolioId;
  });
}

/** Default export for standalone execution */
export default function (): void {
  const email = generateEmail();
  const password = generatePassword();
  setupTestUser(email, password);

  testFullPortfolioFlow();

  cleanupTestUser();
}
