/** Research entries: admin CRUD, limits, slugs, hidden entries, list filters and order. */
import { beforeEach, describe, expect, it } from 'vitest';
import { agentFor, createTestApp, loginAgent } from './helpers.js';

const app = createTestApp();
let admin;
const visitor = () => agentFor(app);

const entry = (overrides = {}) => ({
  title: 'A Study of Token Rotation in REST APIs',
  type: 'paper',
  status: 'published',
  summary: 'Compares refresh-token rotation strategies.',
  ...overrides,
});
const create = (overrides) => admin.post('/api/research').send(entry(overrides));
const fieldsOf = (response) => (response.body.details ?? []).map((detail) => detail.field);

beforeEach(async () => {
  admin = await loginAgent(app);
});

describe('admin routes', () => {
  it('reject a visitor', async () => {
    const created = (await create()).body.data;
    expect((await visitor().post('/api/research').send(entry())).status).toBe(401);
    expect((await visitor().put(`/api/research/${created.id}`).send({ title: 'X' })).status).toBe(
      401,
    );
    expect((await visitor().delete(`/api/research/${created.id}`)).status).toBe(401);
    expect((await visitor().get(`/api/research/id/${created.id}`)).status).toBe(401);
  });

  it('create an entry with defaults and a slug', async () => {
    const response = await create({
      authors: ['Alok Paul', 'A. Coauthor', ''],
      tags: ['Security', 'JWT'],
      paperUrl: 'https://example.org/paper.pdf',
    });
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      slug: 'a-study-of-token-rotation-in-rest-apis',
      featured: false,
      visible: true,
      authors: ['Alok Paul', 'A. Coauthor'],
      tags: ['security', 'jwt'],
      paperUrl: 'https://example.org/paper.pdf',
    });
  });

  it('give a second entry with the same title its own slug', async () => {
    const first = (await create()).body.data;
    const second = (await create()).body.data;
    expect(second.slug).not.toBe(first.slug);
    expect(second.slug).toMatch(/-2$/);
  });

  it('update only the fields sent, and delete', async () => {
    const created = (await create({ venue: 'Some Conference' })).body.data;
    const updated = await admin.put(`/api/research/${created.id}`).send({ status: 'submitted' });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ status: 'submitted', venue: 'Some Conference' });
    expect(updated.body.data.slug).toBe(created.slug);

    expect((await admin.delete(`/api/research/${created.id}`)).status).toBe(200);
    expect((await admin.get(`/api/research/id/${created.id}`)).status).toBe(404);
  });

  it.each([
    ['title', ''],
    ['title', 'x'.repeat(151)],
    ['type', 'book'],
    ['status', 'rejected'],
    ['summary', ''],
    ['summary', 'x'.repeat(301)],
    ['abstract', 'x'.repeat(5001)],
    ['authors', Array(21).fill('Name')],
    ['authors', ['x'.repeat(81)]],
    ['venue', 'x'.repeat(151)],
    ['tags', Array(11).fill('tag')],
    ['tags', ['x'.repeat(31)]],
    ['paperUrl', 'javascript:alert(1)'],
    ['doiUrl', 'not a url'],
    ['codeUrl', 'ftp://example.org/x'],
    ['projectUrl', 'example.org'],
    ['date', 'not-a-date'],
    ['order', -1],
    ['order', 1.5],
    ['featured', 'yes'],
  ])('reject an invalid %s', async (field, value) => {
    const response = await create({ [field]: value });
    expect(response.status).toBe(400);
    expect(fieldsOf(response).some((name) => name.startsWith(field))).toBe(true);
  });

  it('reject unknown fields and a missing required field', async () => {
    expect((await create({ citations: 12 })).status).toBe(400);
    const withoutSummary = entry();
    delete withoutSummary.summary;
    expect((await admin.post('/api/research').send(withoutSummary)).status).toBe(400);
  });
});

describe('hidden entries', () => {
  it('are invisible to visitors but visible to the admin', async () => {
    const shown = (await create({ title: 'Shown' })).body.data;
    const hidden = (await create({ title: 'Hidden draft', visible: false })).body.data;

    const publicList = (await visitor().get('/api/research')).body.data;
    expect(publicList.map((item) => item.id)).toEqual([shown.id]);
    expect((await visitor().get(`/api/research/${hidden.slug}`)).status).toBe(404);
    expect((await visitor().get(`/api/research/${shown.slug}`)).status).toBe(200);

    const adminList = (await admin.get('/api/research')).body.data;
    expect(adminList).toHaveLength(2);
    expect((await admin.get(`/api/research/${hidden.slug}`)).status).toBe(200);
  });
});

describe('GET /api/research', () => {
  it('lists ongoing work first, then newest date, then order', async () => {
    await create({ title: 'Old published', date: '2023-05-01' });
    await create({ title: 'New published B', date: '2025-03-01', order: 2 });
    await create({ title: 'New published A', date: '2025-03-01', order: 1 });
    await create({ title: 'Undated', status: 'submitted' });
    await create({ title: 'Ongoing', status: 'ongoing', date: '2022-01-01' });

    const titles = (await visitor().get('/api/research')).body.data.map((item) => item.title);
    expect(titles).toEqual([
      'Ongoing',
      'New published A',
      'New published B',
      'Old published',
      'Undated',
    ]);
  });

  it('filters by type, status, tag and featured, and limits', async () => {
    await create({ title: 'Paper one', tags: ['security'], featured: true });
    await create({ title: 'Thesis', type: 'thesis', status: 'ongoing' });
    await create({ title: 'Paper two', tags: ['databases'] });

    const titles = async (query) =>
      (await visitor().get(`/api/research?${query}`)).body.data.map((item) => item.title).sort();

    expect(await titles('type=thesis')).toEqual(['Thesis']);
    expect(await titles('status=published')).toEqual(['Paper one', 'Paper two']);
    expect(await titles('tag=security')).toEqual(['Paper one']);
    expect(await titles('featured=true')).toEqual(['Paper one']);
    expect((await visitor().get('/api/research?limit=1')).body.data).toHaveLength(1);
    expect((await visitor().get('/api/research?type=book')).status).toBe(400);
  });
});

describe('settings sections', () => {
  const sections = async () => (await visitor().get('/api/settings')).body.data.sections;

  it('reports research only while a visible entry exists', async () => {
    expect(await sections()).toEqual({ research: false, certifications: false, blog: false });

    const hidden = (await create({ visible: false })).body.data;
    expect((await sections()).research).toBe(false);

    await admin.put(`/api/research/${hidden.id}`).send({ visible: true });
    expect((await sections()).research).toBe(true);

    await admin.delete(`/api/research/${hidden.id}`);
    expect((await sections()).research).toBe(false);
  });
});

describe('admin stats', () => {
  it('counts research entries', async () => {
    await create();
    await create({ visible: false });
    const { counts } = (await admin.get('/api/admin/stats')).body.data;
    expect(counts).toMatchObject({ research: 2, hiddenResearch: 1, certifications: 0 });
  });
});

describe('review hardening', () => {
  it('keeps two authors with the same name, in order, and drops blank lines', async () => {
    const response = await create({ authors: ['J. Smith', 'A. Coauthor', 'J. Smith', '  '] });
    expect(response.body.data.authors).toEqual(['J. Smith', 'A. Coauthor', 'J. Smith']);
  });

  it('clears optional fields on update', async () => {
    const created = (
      await create({
        abstract: 'An abstract.',
        venue: 'A venue',
        date: '2025-03-01',
        paperUrl: 'https://example.org/p.pdf',
        tags: ['one'],
        authors: ['A. Author'],
      })
    ).body.data;

    const updated = await admin.put(`/api/research/${created.id}`).send({
      abstract: '',
      venue: '',
      date: null,
      paperUrl: '',
      tags: [],
      authors: [],
    });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ date: null, tags: [], authors: [] });
    expect(updated.body.data.abstract || '').toBe('');
    expect(updated.body.data.venue || '').toBe('');
    expect(updated.body.data.paperUrl || '').toBe('');
  });

  it.each([[1700000000000], [true], [null]])('rejects %s as a date on create', async (value) => {
    // null is fine on update (it clears the date) but a number or boolean never is.
    const response = await create({ date: value });
    expect(response.status).toBe(value === null ? 201 : 400);
  });

  it('hides a featured draft from a visitor asking for featured entries', async () => {
    await create({ title: 'Featured draft', featured: true, visible: false });
    expect((await visitor().get('/api/research?featured=true')).body.data).toEqual([]);
  });

  it('turns the settings section off when the only entry is hidden', async () => {
    const created = (await create()).body.data;
    await admin.put(`/api/research/${created.id}`).send({ visible: false });
    expect((await visitor().get('/api/settings')).body.data.sections.research).toBe(false);
  });

  it('breaks ties by newest created and applies the limit after sorting', async () => {
    await create({ title: 'First created', date: '2024-01-01' });
    await create({ title: 'Second created', date: '2024-01-01' });
    await create({ title: 'Newest date', date: '2025-01-01' });

    const titles = (await visitor().get('/api/research')).body.data.map((item) => item.title);
    expect(titles).toEqual(['Newest date', 'Second created', 'First created']);

    const limited = (await visitor().get('/api/research?limit=1')).body.data;
    expect(limited.map((item) => item.title)).toEqual(['Newest date']);
  });

  it('marks responses as private, since the admin sees more than visitors', async () => {
    const created = (await create()).body.data;
    for (const path of ['/api/research', `/api/research/${created.slug}`]) {
      const response = await visitor().get(path);
      expect(response.headers['cache-control']).toMatch(/private/);
    }
  });

  it('rejects an order above 10000', async () => {
    expect((await create({ order: 10001 })).status).toBe(400);
  });
});
