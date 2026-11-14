/** Experience dates accept only real dates; null or numbers never become 1 January 1970. */
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, loginAgent } from './helpers.js';

const app = createTestApp();
let admin;
const entry = (overrides = {}) => ({
  type: 'education',
  role: 'B.Sc. in Computer Science',
  startDate: '2025-01-01',
  current: true,
  ...overrides,
});

beforeEach(async () => {
  admin = await loginAgent(app);
});

describe('POST /api/experience dates', () => {
  it.each([[null], [1700000000000], [true]])('rejects %s as the start date', async (value) => {
    expect((await admin.post('/api/experience').send(entry({ startDate: value }))).status).toBe(
      400,
    );
  });

  it('accepts a date string and clears the end date with null', async () => {
    const created = await admin.post('/api/experience').send(entry());
    expect(created.status).toBe(201);
    const updated = await admin
      .put(`/api/experience/${created.body.data.id}`)
      .send({ endDate: null });
    expect(updated.status).toBe(200);
  });
});
