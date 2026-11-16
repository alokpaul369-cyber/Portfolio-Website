/** The Vercel entry point (api/index.js) serves the same API as the normal server. */
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import handler from '../../api/index.js';

const call = (method, path) =>
  request(handler)[method](path).set('X-Requested-With', 'XMLHttpRequest');

describe('Vercel entry point', () => {
  it('serves API routes under /api', async () => {
    const health = await call('get', '/api/health');
    expect(health.status).toBe(200);
    expect(health.body.status).toBe('ok');

    const settings = await call('get', '/api/settings');
    expect(settings.status).toBe(200);
    expect(settings.body.data).toHaveProperty('sections');
  });

  it('keeps admin routes protected', async () => {
    expect((await call('get', '/api/messages')).status).toBe(401);
  });

  it('answers unknown paths with the API not-found response', async () => {
    const response = await call('get', '/api/no-such-route');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
