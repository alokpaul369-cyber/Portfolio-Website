/** Smoke tests: the app starts, and the CSRF header check guards writes. */
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { APP_HEADER, createTestApp } from './helpers.js';

const app = createTestApp();

describe('API basics', () => {
  it('reports health', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('rejects a write without the application header', async () => {
    const response = await request(app).post('/api/auth/logout');
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body.success).toBe(false);

    const allowed = await request(app)
      .post('/api/auth/logout')
      .set(...APP_HEADER);
    expect(allowed.status).toBe(200);
  });
});
