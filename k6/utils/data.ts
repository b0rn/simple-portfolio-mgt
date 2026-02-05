/**
 * Test data generators for k6 load tests
 * Provides utilities for generating random test data
 */

import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { testUserPrefix } from '../config';

export interface Asset {
  symbol: string;
  quantity: number;
}

// Common stock symbols for testing
const stockSymbols: string[] = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
  'NVDA', 'TSLA', 'BRK.A', 'JPM', 'V',
  'JNJ', 'WMT', 'PG', 'MA', 'HD',
  'CVX', 'MRK', 'ABBV', 'PFE', 'KO',
  'PEP', 'COST', 'TMO', 'AVGO', 'MCD',
  'CSCO', 'ABT', 'ACN', 'DHR', 'LLY',
];

// Portfolio name prefixes
const portfolioNamePrefixes: string[] = [
  'Growth', 'Value', 'Dividend', 'Tech', 'Healthcare',
  'Energy', 'Finance', 'Consumer', 'Industrial', 'Real Estate',
  'Retirement', 'Aggressive', 'Conservative', 'Balanced', 'Income',
];

// Portfolio name suffixes
const portfolioNameSuffixes: string[] = [
  'Portfolio', 'Fund', 'Holdings', 'Investments', 'Assets',
  'Strategy', 'Collection', 'Mix', 'Allocation', 'Selection',
];

/** Generate a unique test email */
export function generateEmail(): string {
  const timestamp = Date.now();
  const random = randomString(6);
  return `${testUserPrefix}${timestamp}-${random}@example.com`;
}

/** Generate a valid password (12+ characters) */
export function generatePassword(): string {
  const lower = randomString(4, 'abcdefghijklmnopqrstuvwxyz');
  const upper = randomString(4, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const numbers = randomString(3, '0123456789');
  const special = randomString(1, '!@#$%^&*');
  return `${upper}${lower}${numbers}${special}`;
}

/** Generate a random portfolio name */
export function generatePortfolioName(): string {
  const prefix = portfolioNamePrefixes[randomIntBetween(0, portfolioNamePrefixes.length - 1)];
  const suffix = portfolioNameSuffixes[randomIntBetween(0, portfolioNameSuffixes.length - 1)];
  const random = randomString(4);
  return `${prefix} ${suffix} ${random}`;
}

/** Generate a random asset */
export function generateAsset(): Asset {
  const symbol = stockSymbols[randomIntBetween(0, stockSymbols.length - 1)];
  const quantity = randomIntBetween(1, 1000);
  return { symbol, quantity };
}

/** Generate multiple random assets with unique symbols */
export function generateAssets(count: number): Asset[] {
  const assets: Asset[] = [];
  const usedSymbols = new Set<string>();

  for (let i = 0; i < count; i++) {
    let asset: Asset;
    do {
      asset = generateAsset();
    } while (usedSymbols.has(asset.symbol));

    usedSymbols.add(asset.symbol);
    assets.push(asset);
  }

  return assets;
}

/** Generate a unique VU-specific email */
export function generateVuEmail(vuId: number, iteration: number): string {
  return `${testUserPrefix}vu${vuId}-iter${iteration}@example.com`;
}

/** Get a random stock symbol */
export function getRandomSymbol(): string {
  return stockSymbols[randomIntBetween(0, stockSymbols.length - 1)];
}

/** Get a random quantity for assets */
export function getRandomQuantity(min = 1, max = 1000): number {
  return randomIntBetween(min, max);
}
