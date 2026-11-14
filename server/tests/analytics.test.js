/** Visitor analytics: what is counted, what is ignored, day boundaries and the admin summary. */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { agentFor, createTestApp, loginAgent } from './helpers.js';
import { BlogPost, DailyStat, Project, Research } from '../src/models/index.js';
import { dayKey, dayStart, MAX_DAILY_SOURCES } from '../src/services/analyticsService.js';

const app = createTestApp();
const BROWSER =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36';

const view = (body, agent = agentFor(app)) =>
  agent.post('/api/analytics/view').set('User-Agent', BROWSER).send(body);

/** Today's totals as { "page:/": 2, "visit:all": 1, "source:google.com": 1, ... } */
async function totals() {
  const rows = await DailyStat.find({});
  return Object.fromEntries(rows.map((row) => [`${row.kind}:${row.key}`, row.count]));
}

beforeEach(async () => {
  await Project.create({ title: 'Real Project', description: 'A project.', category: 'backend' });
  await BlogPost.create({ title: 'Published Post', content: 'Text.', published: true });
  await BlogPost.create({ title: 'Draft Post', content: 'Text.', published: false });
  await Research.create({
    title: 'Visible Study',
    type: 'paper',
    status: 'ongoing',
    summary: 'S.',
  });
  await Research.create({
    title: 'Hidden Study',
    type: 'paper',
    status: 'ongoing',
    summary: 'S.',
    visible: false,
  });
});

describe('POST /api/analytics/view', () => {
  it('counts known pages and existing public slugs', async () => {
    for (const path of [
      '/',
      '/about',
      '/projects/real-project',
      '/blog/published-post',
      '/research/visible-study',
      '/blog/?q=x#top',
    ]) {
      expect((await view({ path })).status).toBe(204);
    }
    expect(await totals()).toEqual({
      'page:/': 1,
      'page:/about': 1,
      'page:/projects/real-project': 1,
      'page:/blog/published-post': 1,
      'page:/research/visible-study': 1,
      'page:/blog': 1,
    });
  });

  it('ignores unknown paths, missing or private slugs and the admin area, always with 204', async () => {
    for (const path of [
      '/does-not-exist',
      '/projects/no-such-project',
      '/blog/draft-post',
      '/research/hidden-study',
      '/admin',
      '/admin/messages',
      'not-a-path',
      `/${'x'.repeat(600)}`,
    ]) {
      const response = await view({ path });
      expect(response.status).toBe(204);
      expect(response.text).toBe('');
    }
    expect(await totals()).toEqual({});
  });

  it('answers 204 to a malformed body', async () => {
    expect((await view({ nonsense: true })).status).toBe(204);
    expect((await view({ path: 42 })).status).toBe(204);
    expect(await totals()).toEqual({});
  });

  it('ignores the signed-in owner and bots', async () => {
    const admin = await loginAgent(app);
    await view({ path: '/', newVisit: true }, admin);

    const bot = await agentFor(app)
      .post('/api/analytics/view')
      .set('User-Agent', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')
      .send({ path: '/' });
    expect(bot.status).toBe(204);
    expect(await totals()).toEqual({});
  });

  it('counts a visit and its source only for a new visit, by domain', async () => {
    await view({ path: '/', newVisit: true, referrer: 'https://www.google.com/search?q=alok' });
    await view({ path: '/about', newVisit: false, referrer: 'https://www.google.com/' });
    await view({ path: '/blog', newVisit: true });
    await view({ path: '/projects', newVisit: true, referrer: 'https://linkedin.com/in/someone' });

    expect(await totals()).toMatchObject({
      'visit:all': 3,
      'source:google.com': 1,
      'source:direct': 1,
      'source:linkedin.com': 1,
    });
  });

  it('does not count the site itself as a source', async () => {
    await view({ path: '/', newVisit: true, referrer: 'http://localhost:5173/blog' });
    const counted = await totals();
    expect(counted['visit:all']).toBe(1);
    expect(Object.keys(counted).filter((key) => key.startsWith('source:'))).toEqual([]);
  });

  it('stores nothing that identifies the visitor', async () => {
    await view({ path: '/', newVisit: true, referrer: 'https://www.google.com/search?q=secret' });
    const raw = await DailyStat.collection.find({}).toArray();
    const text = JSON.stringify(raw);
    expect(text).not.toMatch(/secret|Mozilla|127\.0\.0\.1|::1|q=/);
    for (const row of raw) {
      expect(Object.keys(row).sort()).toEqual(
        ['__v', '_id', 'count', 'createdAt', 'date', 'key', 'kind', 'updatedAt'].sort(),
      );
    }
  });
});

describe('day boundaries', () => {
  it('counts days in Bangladesh time', () => {
    expect(dayKey(new Date('2026-01-01T17:59:59Z'), 'Asia/Dhaka')).toBe('2026-01-01');
    expect(dayKey(new Date('2026-01-01T18:00:00Z'), 'Asia/Dhaka')).toBe('2026-01-02');
    expect(dayStart('2026-01-02').toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });
});

describe('GET /api/analytics/summary', () => {
  const summary = (agent, days = 7) => agent.get(`/api/analytics/summary?days=${days}`);

  /** Stores a total for the day `daysAgo` before today (in the configured time zone). */
  async function stat(daysAgo, kind, key, count) {
    const today = dayStart(dayKey(new Date()));
    const date = new Date(today.getTime() - daysAgo * 86400000);
    await DailyStat.create({ date, kind, key, count });
  }

  it('is for the admin only and accepts 7, 30 or 90 days', async () => {
    expect((await summary(agentFor(app))).status).toBe(401);
    const admin = await loginAgent(app);
    expect((await summary(admin, 7)).status).toBe(200);
    expect((await summary(admin, 30)).status).toBe(200);
    expect((await summary(admin, 90)).status).toBe(200);
    expect((await summary(admin, 14)).status).toBe(400);
  });

  it('totals the period, compares with the one before and fills empty days', async () => {
    await stat(0, 'page', '/', 5);
    await stat(0, 'page', '/blog', 2);
    await stat(2, 'page', '/', 3);
    await stat(0, 'visit', 'all', 4);
    await stat(0, 'source', 'google.com', 3);
    await stat(0, 'source', 'direct', 1);
    await stat(9, 'page', '/', 6); // previous 7-day period
    await stat(9, 'visit', 'all', 2);
    await stat(30, 'page', '/', 100); // outside both periods

    const admin = await loginAgent(app);
    const { data } = (await summary(admin, 7)).body;

    expect(data.days).toBe(7);
    expect(data.totals).toEqual({ views: 10, visits: 4 });
    expect(data.previous).toEqual({ views: 6, visits: 2 });
    expect(data.series).toHaveLength(7);
    expect(data.series.at(-1)).toMatchObject({ views: 7, visits: 4 });
    expect(data.series.at(-3)).toMatchObject({ views: 3, visits: 0 });
    expect(data.series.filter((day) => day.views === 0)).toHaveLength(5);
    expect(data.series[0].date < data.series.at(-1).date).toBe(true);
    expect(data.topPages).toEqual([
      { path: '/', views: 8 },
      { path: '/blog', views: 2 },
    ]);
    expect(data.topSources).toEqual([
      { source: 'google.com', visits: 3 },
      { source: 'direct', visits: 1 },
    ]);
  });

  it('adds weekly page views to the dashboard stats', async () => {
    await stat(0, 'page', '/', 4);
    await stat(6, 'page', '/about', 1);
    await stat(7, 'page', '/', 50);
    const admin = await loginAgent(app);
    const { counts } = (await admin.get('/api/admin/stats')).body.data;
    expect(counts.viewsLast7Days).toBe(5);
  });
});

describe('review hardening', () => {
  it('caps new sources per day and counts the rest as "other"', async () => {
    for (let i = 0; i < MAX_DAILY_SOURCES; i += 1) {
      await DailyStat.create({
        date: dayStart(dayKey()),
        kind: 'source',
        key: `site${i}.test`,
        count: 1,
      });
    }
    await view({ path: '/', newVisit: true, referrer: 'https://brand-new.test/' });
    await view({ path: '/', newVisit: true, referrer: 'https://site3.test/' });

    const counted = await totals();
    expect(counted['source:brand-new.test']).toBeUndefined();
    expect(counted['source:other']).toBe(1);
    expect(counted['source:site3.test']).toBe(2);
  });

  it('still answers 204 when counting fails', async () => {
    const spy = vi.spyOn(DailyStat, 'updateOne').mockRejectedValueOnce(new Error('database down'));
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const response = await view({ path: '/' });
    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    spy.mockRestore();
    errors.mockRestore();
  });
});
