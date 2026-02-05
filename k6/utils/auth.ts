/**
 * Authentication utilities for k6 load tests
 * Handles user registration, login, logout, and session management
 */

import http, { RefinedResponse, ResponseType } from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';
import { BASE_URL, endpoints, headers } from '../config';

type HttpResponse = RefinedResponse<ResponseType | undefined>;

// Custom metrics for auth operations
export const authLoginDuration = new Trend('auth_login_duration', true);

/** Register a new user */
export function registerUser(email: string, password: string): HttpResponse {
  const payload = JSON.stringify({
    email: email,
    password: password,
  });

  const response = http.post(
    `${BASE_URL}${endpoints.register}`,
    payload,
    { headers }
  );

  check(response, {
    'register: status is 201': (r) => r.status === 201,
    'register: has user data': (r) => {
      const body = r.json() as Record<string, Record<string, unknown>>;
      return !!(body.user && body.user.id && body.user.email);
    },
  });

  return response;
}

/** Login a user and obtain session cookie */
export function loginUser(email: string, password: string): HttpResponse {
  const payload = JSON.stringify({
    email: email,
    password: password,
  });

  const response = http.post(
    `${BASE_URL}${endpoints.login}`,
    payload,
    { headers }
  );

  authLoginDuration.add(response.timings.duration);

  check(response, {
    'login: status is 200': (r) => r.status === 200,
    'login: has user data': (r) => {
      const body = r.json() as Record<string, Record<string, unknown>>;
      return !!(body.user && body.user.id && body.user.email);
    },
    'login: cookie is set': (r) => {
      const cookies = r.cookies;
      return !!(cookies && cookies['access_token'] && cookies['access_token'].length > 0);
    },
  });

  return response;
}

/** Logout the current user */
export function logoutUser(): HttpResponse {
  const response = http.post(
    `${BASE_URL}${endpoints.logout}`,
    null,
    { headers }
  );

  check(response, {
    'logout: status is 200': (r) => r.status === 200,
    'logout: status is ok': (r) => {
      const body = r.json() as Record<string, unknown>;
      return body.status === 'ok';
    },
  });

  return response;
}

/** Get current authenticated user info */
export function getCurrentUser(): HttpResponse {
  const response = http.get(
    `${BASE_URL}${endpoints.me}`,
    { headers }
  );

  check(response, {
    'me: status is 200': (r) => r.status === 200,
    'me: has user data': (r) => {
      const body = r.json() as Record<string, Record<string, unknown>>;
      return !!(body.user && body.user.id && body.user.email);
    },
  });

  return response;
}

/** Setup a test user (register + login) */
export function setupTestUser(email: string, password: string): Record<string, unknown> {
  // Try to register (may fail if user exists)
  http.post(
    `${BASE_URL}${endpoints.register}`,
    JSON.stringify({ email, password }),
    { headers }
  );

  // Login regardless of registration result
  const loginRes = loginUser(email, password);

  return loginRes.json() as Record<string, unknown>;
}

/** Cleanup: logout current user */
export function cleanupTestUser(): void {
  logoutUser();
}
