/** Certifications: admin CRUD, date rules, order and certificate image clean-up. */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Cloudinary is replaced entirely; only deletions matter here.
const cloud = vi.hoisted(() => ({ destroyed: [] }));

vi.mock('../src/config/cloudinary.js', () => ({
  isCloudinaryConfigured: true,
  default: {
    uploader: {
      async destroy(publicId, options) {
        cloud.destroyed.push({ publicId, ...options });
        return { result: 'ok' };
      },
    },
  },
}));

const { agentFor, createTestApp, loginAgent } = await import('./helpers.js');

const app = createTestApp();
let admin;
const visitor = () => agentFor(app);

const image = (name) => ({
  url: `https://res.cloudinary.com/demo/image/upload/portfolio/certificates/${name}.png`,
  publicId: `portfolio/certificates/${name}`,
  alt: 'Certificate',
});
const cert = (overrides = {}) => ({
  title: 'Node.js Application Development',
  issuer: 'Example Academy',
  issueDate: '2025-06-01',
  ...overrides,
});
const create = (overrides) => admin.post('/api/certifications').send(cert(overrides));
const fieldsOf = (response) => (response.body.details ?? []).map((detail) => detail.field);

beforeEach(async () => {
  cloud.destroyed.length = 0;
  admin = await loginAgent(app);
});

describe('admin routes', () => {
  it('reject a visitor', async () => {
    const created = (await create()).body.data;
    expect((await visitor().post('/api/certifications').send(cert())).status).toBe(401);
    expect(
      (await visitor().put(`/api/certifications/${created.id}`).send({ title: 'X' })).status,
    ).toBe(401);
    expect((await visitor().delete(`/api/certifications/${created.id}`)).status).toBe(401);
  });

  it('create, update part of, and delete an entry', async () => {
    const created = await create({
      credentialId: 'ABC-123',
      credentialUrl: 'https://example.org/v/abc',
    });
    expect(created.status).toBe(201);

    const updated = await admin
      .put(`/api/certifications/${created.body.data.id}`)
      .send({ issuer: 'Another Academy' });
    expect(updated.body.data).toMatchObject({
      issuer: 'Another Academy',
      credentialId: 'ABC-123',
    });

    expect((await admin.delete(`/api/certifications/${created.body.data.id}`)).status).toBe(200);
    expect((await visitor().get('/api/certifications')).body.data).toEqual([]);
  });

  it.each([
    ['title', ''],
    ['title', 'x'.repeat(151)],
    ['issuer', ''],
    ['issuer', 'x'.repeat(101)],
    ['issueDate', 'not-a-date'],
    ['credentialId', 'x'.repeat(101)],
    ['credentialUrl', 'javascript:alert(1)'],
    ['order', -1],
  ])('reject an invalid %s', async (field, value) => {
    const response = await create({ [field]: value });
    expect(response.status).toBe(400);
    expect(fieldsOf(response).some((name) => name.startsWith(field))).toBe(true);
  });

  it('require the issue date and reject unknown fields', async () => {
    const withoutDate = cert();
    delete withoutDate.issueDate;
    expect((await admin.post('/api/certifications').send(withoutDate)).status).toBe(400);
    expect((await create({ score: 98 })).status).toBe(400);
  });
});

describe('dates', () => {
  it('reject an expiry before the issue date on create', async () => {
    const response = await create({ expiryDate: '2025-01-01' });
    expect(response.status).toBe(400);
    expect(fieldsOf(response)).toContain('expiryDate');
  });

  it('reject it on a partial update of either date', async () => {
    const created = (await create({ expiryDate: '2027-06-01' })).body.data;
    const path = `/api/certifications/${created.id}`;

    expect((await admin.put(path).send({ expiryDate: '2024-01-01' })).status).toBe(400);
    expect((await admin.put(path).send({ issueDate: '2028-01-01' })).status).toBe(400);
    expect((await admin.put(path).send({ expiryDate: null })).status).toBe(200);
    expect(
      (await admin.get(`/api/certifications/id/${created.id}`)).body.data.expiryDate,
    ).toBeNull();
  });
});

describe('GET /api/certifications', () => {
  it('lists the newest issue date first, then by order', async () => {
    await create({ title: 'Older', issueDate: '2023-01-01' });
    await create({ title: 'Newer B', issueDate: '2025-06-01', order: 2 });
    await create({ title: 'Newer A', issueDate: '2025-06-01', order: 1 });

    const titles = (await visitor().get('/api/certifications')).body.data.map((item) => item.title);
    expect(titles).toEqual(['Newer A', 'Newer B', 'Older']);
  });

  it('turns the settings section on and off', async () => {
    const sections = async () => (await visitor().get('/api/settings')).body.data.sections;
    expect((await sections()).certifications).toBe(false);
    const created = (await create()).body.data;
    expect((await sections()).certifications).toBe(true);
    await admin.delete(`/api/certifications/${created.id}`);
    expect((await sections()).certifications).toBe(false);
  });
});

describe('certificate image clean-up', () => {
  it('deletes the old image once when it is replaced, removed or the entry is deleted', async () => {
    const created = (await create({ image: image('first') })).body.data;
    const path = `/api/certifications/${created.id}`;

    await admin.put(path).send({ title: 'Renamed' });
    expect(cloud.destroyed).toHaveLength(0);

    await admin.put(path).send({ image: image('second') });
    expect(cloud.destroyed.map((item) => item.publicId)).toEqual(['portfolio/certificates/first']);

    await admin.put(path).send({ image: null });
    expect(cloud.destroyed.map((item) => item.publicId)).toEqual([
      'portfolio/certificates/first',
      'portfolio/certificates/second',
    ]);

    await admin.delete(path);
    expect(cloud.destroyed).toHaveLength(2);
  });

  it('deletes the image with the entry, and nothing when there is no image', async () => {
    const withImage = (await create({ image: image('third') })).body.data;
    const without = (await create({ title: 'No image' })).body.data;

    await admin.delete(`/api/certifications/${without.id}`);
    expect(cloud.destroyed).toHaveLength(0);

    await admin.delete(`/api/certifications/${withImage.id}`);
    expect(cloud.destroyed.map((item) => item.publicId)).toEqual(['portfolio/certificates/third']);
  });

  it('refuses to delete an upload that a certification still uses', async () => {
    await create({ image: image('fourth') });
    const response = await admin
      .delete('/api/uploads')
      .send({ publicId: 'portfolio/certificates/fourth' });
    expect(response.status).toBe(409);
  });
});

describe('review hardening', () => {
  it('rejects a visitor reading one entry by id', async () => {
    const created = (await create()).body.data;
    expect((await visitor().get(`/api/certifications/id/${created.id}`)).status).toBe(401);
  });

  it.each([[null], [0], [true], ['']])('rejects %s as the issue date', async (value) => {
    const response = await create({ issueDate: value });
    expect(response.status).toBe(400);
    expect(fieldsOf(response)).toContain('issueDate');
  });

  it('accepts an expiry on the issue date', async () => {
    const response = await create({ issueDate: '2025-06-01', expiryDate: '2025-06-01' });
    expect(response.status).toBe(201);
  });

  it('stores dates exactly as entered, at midnight UTC', async () => {
    const created = (await create({ issueDate: '2025-06-01' })).body.data;
    expect(created.issueDate).toBe('2025-06-01T00:00:00.000Z');
  });
});
