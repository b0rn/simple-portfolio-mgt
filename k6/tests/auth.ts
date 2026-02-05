/**
 * Authentication endpoint tests for k6 load testing
 * Tests: register, login, logout, me
 */

import http, { RefinedResponse, ResponseType } from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { BASE_URL, endpoints, headers } from '../config';
import { generateEmail, generatePassword } from '../utils/data';

type HttpResponse = RefinedResponse<ResponseType | undefined>;

// Custom metrics for auth operations
export const registerDuration = new Trend('auth_register_duration', true);
export const loginDuration = new Trend('auth_login_duration', true);
export const logoutDuration = new Trend('auth_logout_duration', true);
export const meDuration = new Trend('auth_me_duration', true);
export const authErrors = new Counter('auth_errors');

interface RegisterResult {
  email: string;
  password: string;
  response: HttpResponse;
}

/** Test user registration endpoint */
export function testRegister(): RegisterResult {
  const email = generateEmail();
  const password = generatePassword();

  const response = http.post(
    `${BASE_URL}${endpoints.register}`,
    JSON.stringify({ email, password }),
    { headers, tags: { name: 'POST /auth/register' } }
  );

  registerDuration.add(response.timings.duration);

  const success = check(response, {
    'register: status is 201': (r) => r.status === 201,
    'register: response has user': (r) => {
      try {
        const body = r.json() as Record<string, Record<string, unknown>>;
        return !!(body.user && body.user.id && body.user.email === email);
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    authErrors.add(1);
  }

  return { email, password, response };
}

/** Test user login endpoint */
export function testLogin(email: string, password: string): HttpResponse {
  const response = http.post(
    `${BASE_URL}${endpoints.login}`,
    JSON.stringify({ email, password }),
    { headers, tags: { name: 'POST /auth/login' } }
  );

  loginDuration.add(response.timings.duration);

  const success = check(response, {
    'login: status is 200': (r) => r.status === 200,
    'login: response has user': (r) => {
      try {
        const body = r.json() as Record<string, Record<string, unknown>>;
        return !!(body.user && body.user.id);
      } catch (e) {
        return false;
      }
    },
    'login: cookie is set': (r) => {
      const cookies = r.cookies;
      return !!(cookies && cookies['access_token'] && cookies['access_token'].length > 0);
    },
  });

  if (!success) {
    authErrors.add(1);
  }

  return response;
}

/** Test get current user endpoint (requires authentication) */
export function testMe(): HttpResponse {
  const response = http.get(
    `${BASE_URL}${endpoints.me}`,
    { headers, tags: { name: 'GET /auth/me' } }
  );

  meDuration.add(response.timings.duration);

  const success = check(response, {
    'me: status is 200': (r) => r.status === 200,
    'me: response has user': (r) => {
      try {
        const body = r.json() as Record<string, Record<string, unknown>>;
        return !!(body.user && body.user.id && body.user.email);
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    authErrors.add(1);
  }

  return response;
}

/** Test logout endpoint */
export function testLogout(): HttpResponse {
  const response = http.post(
    `${BASE_URL}${endpoints.logout}`,
    null,
    { headers, tags: { name: 'POST /auth/logout' } }
  );

  logoutDuration.add(response.timings.duration);

  const success = check(response, {
    'logout: status is 200': (r) => r.status === 200,
    'logout: status is ok': (r) => {
      try {
        const body = r.json() as Record<string, unknown>;
        return body.status === 'ok';
      } catch (e) {
        return false;
      }
    },
  });

  if (!success) {
    authErrors.add(1);
  }

  return response;
}

/** Test invalid login attempt */
export function testInvalidLogin(): HttpResponse {
  const response = http.post(
    `${BASE_URL}${endpoints.login}`,
    JSON.stringify({
      email: 'invalid@example.com',
      password: 'wrongpassword123',
    }),
    { headers, tags: { name: 'POST /auth/login (invalid)' } }
  );

  check(response, {
    'invalid login: status is 401 or 400': (r) => r.status === 401 || r.status === 400,
  });

  return response;
}

/** Test unauthorized access to /me endpoint */
export function testUnauthorizedMe(): HttpResponse {
  const response = http.get(
    `${BASE_URL}${endpoints.me}`,
    {
      headers,
      tags: { name: 'GET /auth/me (unauthorized)' },
      jar: undefined,
    }
  );

  check(response, {
    'unauthorized me: status is 401': (r) => r.status === 401,
  });

  return response;
}

/**
 * Full authentication flow test
 * Register -> Login -> Me -> Logout
 */
export function testFullAuthFlow(): { email: string; password: string } | undefined {
  return group('Full Auth Flow', () => {
    const { email, password } = testRegister();
    sleep(0.5);

    testLogin(email, password);
    sleep(0.5);

    testMe();
    sleep(0.5);

    testLogout();
    sleep(0.5);

    return { email, password };
  });
}

/** Default export for standalone execution */
export default function (): void {
  testFullAuthFlow();
}
