/**
 * Asset endpoint tests for k6 load testing
 * Tests: add asset, list assets, delete asset, get prices
 */

import http, { RefinedResponse, ResponseType } from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { BASE_URL, endpoints, headers, pagination } from '../config';
import { generateAsset, generateAssets } from '../utils/data';
import { setupTestUser, cleanupTestUser } from '../utils/auth';
import { generateEmail, generatePassword } from '../utils/data';
import { createPortfolio, deletePortfolio } from './portfolios';

type HttpResponse = RefinedResponse<ResponseType | undefined>;

// Custom metrics for asset operations
export const addAssetDuration = new Trend('asset_add_duration', true);
export const listAssetsDuration = new Trend('asset_list_duration', true);
export const deleteAssetDuration = new Trend('asset_delete_duration', true);
export const getPricesDuration = new Trend('asset_prices_duration', true);
export const assetErrors = new Counter('asset_errors');

/** Add an asset to a portfolio */
export function addAsset(portfolioId: number, symbol?: string, quantity?: number): HttpResponse {
  const asset = symbol && quantity ? { symbol, quantity } : generateAsset();

  const response = http.post(
    `${BASE_URL}${endpoints.assets(portfolioId)}`,
    JSON.stringify(asset),
    { headers, tags: { name: 'POST /portfolios/{id}/assets' } }
  );

  addAssetDuration.add(response.timings.duration);

  const success = check(response, {
    'add asset: status is 201': (r) => r.status === 201,
    'add asset: has id': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return body.id !== undefined;
      } catch (e) {
        return false;
      }
    },
    'add asset: symbol matches': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return body.symbol === asset.symbol;
      } catch (e) {
        return false;
      }
    },
    'add asset: quantity matches': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return body.quantity === asset.quantity;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    assetErrors.add(1);
  }

  return response;
}

/** List all assets in a portfolio */
export function listAssets(
  portfolioId: number,
  page: number = pagination.defaultPage,
  itemsPerPage: number = pagination.defaultItemsPerPage,
): HttpResponse {
  const response = http.get(
    `${BASE_URL}${endpoints.assets(portfolioId)}?page=${page}&items_per_page=${itemsPerPage}`,
    { headers, tags: { name: 'GET /portfolios/{id}/assets' } }
  );

  listAssetsDuration.add(response.timings.duration);

  const success = check(response, {
    'list assets: status is 200': (r) => r.status === 200,
    'list assets: has items array': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return Array.isArray(body.items);
      } catch (e) {
        return false;
      }
    },
    'list assets: has pagination': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return body.pagination_response !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    assetErrors.add(1);
  }

  return response;
}

/** Delete an asset from a portfolio */
export function deleteAsset(portfolioId: number, assetId: number): HttpResponse {
  const response = http.del(
    `${BASE_URL}${endpoints.asset(portfolioId, assetId)}`,
    null,
    { headers, tags: { name: 'DELETE /portfolios/{id}/assets/{id}' } }
  );

  deleteAssetDuration.add(response.timings.duration);

  const success = check(response, {
    'delete asset: status is 204': (r) => r.status === 204,
  });

  if (!success) {
    assetErrors.add(1);
  }

  return response;
}

/** Get current asset prices */
export function getPrices(): HttpResponse {
  const response = http.get(
    `${BASE_URL}${endpoints.prices}`,
    { headers, tags: { name: 'GET /prices' } }
  );

  getPricesDuration.add(response.timings.duration);

  const success = check(response, {
    'get prices: status is 200': (r) => r.status === 200,
    'get prices: is object': (r) => {
      try {
        const body = r.json();
        return typeof body === 'object' && body !== null;
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    assetErrors.add(1);
  }

  return response;
}

/** Add multiple assets to a portfolio */
export function addMultipleAssets(portfolioId: number, count = 5): number[] {
  const assets = generateAssets(count);
  const assetIds: number[] = [];

  for (const asset of assets) {
    const response = addAsset(portfolioId, asset.symbol, asset.quantity);
    if (response.status === 201) {
      assetIds.push((response.json() as Record<string, number>).id);
    }
    sleep(0.1);
  }

  return assetIds;
}

/** Test asset not found */
export function testAssetNotFound(portfolioId: number, invalidId = 999999): HttpResponse {
  const response = http.del(
    `${BASE_URL}${endpoints.asset(portfolioId, invalidId)}`,
    null,
    { headers, tags: { name: 'DELETE /portfolios/{id}/assets/{id} (not found)' } }
  );

  check(response, {
    'asset not found: status is 404': (r) => r.status === 404,
  });

  return response;
}

/** Full asset CRUD flow test */
export function testFullAssetFlow(portfolioId: number): number | undefined {
  return group('Full Asset Flow', () => {
    getPrices();
    sleep(0.3);

    const addRes = addAsset(portfolioId);
    const assetId = (addRes.json() as Record<string, number>).id;
    sleep(0.3);

    listAssets(portfolioId);
    sleep(0.3);

    addMultipleAssets(portfolioId, 3);
    sleep(0.3);

    listAssets(portfolioId);
    sleep(0.3);

    deleteAsset(portfolioId, assetId);

    return assetId;
  });
}

/** Default export for standalone execution */
export default function (): void {
  const email = generateEmail();
  const password = generatePassword();
  setupTestUser(email, password);

  const portfolioRes = createPortfolio();
  const portfolioId = (portfolioRes.json() as Record<string, number>).id;
  sleep(0.3);

  testFullAssetFlow(portfolioId);

  deletePortfolio(portfolioId);
  cleanupTestUser();
}
