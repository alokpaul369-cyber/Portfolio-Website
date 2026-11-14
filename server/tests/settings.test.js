/** Site settings: public read, admin partial updates, limits and clearing fields. */
import { beforeEach, describe, expect, it } from 'vitest';
import { agentFor, createTestApp, loginAgent } from './helpers.js';
import { SiteSettings } from '../src/models/index.js';

const app = createTestApp();
let admin;

beforeEach(async () => {
  admin = await loginAgent(app);
});

const get = () => agentFor(app).get('/api/settings');
const put = (body) => admin.put('/api/settings').send(body);
const fieldsOf = (response) => (response.body.details ?? []).map((detail) => detail.field);

describe('GET /api/settings', () => {
  it('returns empty content and no CV on a fresh database', async () => {
    const response = await get();
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      profileImage: null,
      content: {},
      cv: null,
      sections: { research: false, certifications: false, blog: false },
    });
  });

  it('still works for a settings document saved before content existed', async () => {
    await SiteSettings.collection.insertOne({
      key: 'main',
      profileImage: { url: 'https://example.test/photo.jpg', publicId: 'portfolio/profile/a' },
    });
    const response = await get();
    expect(response.status).toBe(200);
    expect(response.body.data.profileImage.url).toBe('https://example.test/photo.jpg');
    expect(response.body.data.content).toEqual({});
    expect(response.body.data.cv).toBeNull();
  });
});

describe('PUT /api/settings', () => {
  it('requires a signed-in admin', async () => {
    const response = await agentFor(app)
      .put('/api/settings')
      .send({ content: { role: 'Developer' } });
    expect(response.status).toBe(401);
  });

  it('saves one field without touching the others', async () => {
    await put({ content: { role: 'Backend Developer' } });
    const response = await put({ content: { tagline: 'I build APIs.' } });
    expect(response.status).toBe(200);
    expect((await get()).body.data.content).toEqual({
      role: 'Backend Developer',
      tagline: 'I build APIs.',
    });
  });

  it('leaves the profile photo alone when only content is sent', async () => {
    const photo = { url: 'https://example.test/photo.jpg', publicId: 'portfolio/profile/a' };
    await put({ profileImage: photo });
    await put({ content: { location: 'Dhaka' } });
    expect((await get()).body.data.profileImage.url).toBe(photo.url);
  });

  it('clears a field back to the default with null', async () => {
    await put({ content: { role: 'Backend Developer', tagline: 'I build APIs.' } });
    await put({ content: { tagline: null } });
    expect((await get()).body.data.content).toEqual({ role: 'Backend Developer' });
  });

  it('saves and clears paragraphs and key facts', async () => {
    const content = {
      aboutParagraphs: ['First paragraph.', 'Second paragraph.'],
      keyFacts: [{ value: '10+', label: 'Projects' }],
    };
    await put({ content });
    expect((await get()).body.data.content).toEqual(content);

    await put({ content: { keyFacts: [] } });
    expect((await get()).body.data.content.keyFacts).toEqual([]);

    await put({ content: { aboutParagraphs: null, keyFacts: null } });
    expect((await get()).body.data.content).toEqual({});
  });

  it.each([
    ['role', 'x'.repeat(61)],
    ['tagline', 'x'.repeat(241)],
    ['location', 'x'.repeat(61)],
    ['availability', 'x'.repeat(81)],
    ['email', 'not-an-email'],
    ['linkedin', 'http://linkedin.com/in/someone'],
    ['linkedin', 'https://example.com/in/someone'],
    ['linkedin', 'https://notlinkedin.com/in/someone'],
    ['aboutParagraphs', []],
    ['aboutParagraphs', Array(7).fill('Paragraph.')],
    ['keyFacts', Array(5).fill({ value: '1', label: 'Fact' })],
  ])('rejects an invalid %s', async (field, value) => {
    const response = await put({ content: { [field]: value } });
    expect(response.status).toBe(400);
    expect(fieldsOf(response).some((name) => name.startsWith(`content.${field}`))).toBe(true);
    expect((await get()).body.data.content).toEqual({});
  });

  it('rejects an over-long paragraph and over-long key fact parts', async () => {
    expect((await put({ content: { aboutParagraphs: ['x'.repeat(1001)] } })).status).toBe(400);
    expect(
      (await put({ content: { keyFacts: [{ value: 'x'.repeat(9), label: 'Fact' }] } })).status,
    ).toBe(400);
    expect(
      (await put({ content: { keyFacts: [{ value: '1', label: 'x'.repeat(31) }] } })).status,
    ).toBe(400);
  });

  it('accepts a LinkedIn profile URL on linkedin.com or a subdomain', async () => {
    for (const linkedin of [
      'https://linkedin.com/in/someone',
      'https://www.linkedin.com/in/someone',
    ]) {
      expect((await put({ content: { linkedin } })).status).toBe(200);
      expect((await get()).body.data.content.linkedin).toBe(linkedin);
    }
  });

  it('rejects unknown keys', async () => {
    expect((await put({ content: { name: 'Someone Else' } })).status).toBe(400);
    expect((await put({ theme: 'dark' })).status).toBe(400);
  });

  it('saves and clears the CV, never exposing its public id', async () => {
    const cv = {
      url: 'https://res.cloudinary.com/demo/raw/upload/portfolio/documents/cv.pdf',
      publicId: 'portfolio/documents/cv.pdf',
      filename: 'Alok-Paul-CV.pdf',
    };
    expect((await put({ cv })).status).toBe(200);
    expect((await get()).body.data.cv).toEqual({ url: cv.url, filename: cv.filename });

    expect((await put({ cv: null })).status).toBe(200);
    expect((await get()).body.data.cv).toBeNull();
  });

  it("rejects a CV that is not one of this site's uploads", async () => {
    const response = await put({
      cv: { url: 'https://evil.test/cv.pdf', publicId: 'someone-else/cv.pdf', filename: 'cv.pdf' },
    });
    expect(response.status).toBe(400);
  });
});
