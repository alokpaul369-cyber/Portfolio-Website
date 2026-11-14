/**
 * Shared helpers for API tests: build the app, create an admin and obtain a
 * signed-in Supertest agent. Every request carries the header the server's
 * CSRF check requires.
 */
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Admin } from '../src/models/index.js';

export const APP_HEADER = ['X-Requested-With', 'XMLHttpRequest'];

export const TEST_ADMIN = Object.freeze({
  email: 'admin@example.test',
  password: 'correct-horse-battery-staple',
});

/** The Express application, without a listening port. */
export function createTestApp() {
  return createApp();
}

/** Inserts an admin; the model hashes the password. */
export function createAdmin(credentials = TEST_ADMIN) {
  return Admin.create(credentials);
}

/** A Supertest agent with the app header preset; cookies persist across its requests. */
export function agentFor(app) {
  return request.agent(app).set(...APP_HEADER);
}

/** Creates the admin when missing, signs in and returns the agent holding the session cookie. */
export async function loginAgent(app, credentials = TEST_ADMIN) {
  if (!(await Admin.exists({ email: credentials.email }))) await createAdmin(credentials);
  const agent = agentFor(app);
  const response = await agent.post('/api/auth/login').send(credentials);
  if (response.status !== 200) {
    throw new Error(`Test login failed with status ${response.status}`);
  }
  return agent;
}
