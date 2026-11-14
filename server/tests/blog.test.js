/** Blog additions: the menu flag, related posts and the RSS feed. Drafts never leak. */
import { beforeEach, describe, expect, it } from 'vitest';
import { agentFor, createTestApp, loginAgent } from './helpers.js';
import env from '../src/config/env.js';
import { BlogPost } from '../src/models/index.js';

const app = createTestApp();
let admin;
const visitor = () => agentFor(app);

/** Creates a post directly, with a chosen publication date. */
let counter = 0;
async function post({ title, tags = [], published = true, daysAgo = 0, excerpt } = {}) {
  counter += 1;
  return BlogPost.create({
    title: title ?? `Post ${counter}`,
    content: `Body of post ${counter}. ${'word '.repeat(20)}`,
    tags,
    published,
    excerpt,
    publishedAt: published ? new Date(Date.UTC(2026, 0, 1) - daysAgo * 86400000) : null,
  });
}

beforeEach(async () => {
  admin = await loginAgent(app);
});

describe('settings sections.blog', () => {
  const blogFlag = async () => (await visitor().get('/api/settings')).body.data.sections.blog;

  it('is false with no posts or only drafts, true once a post is published', async () => {
    expect(await blogFlag()).toBe(false);
    const draft = await post({ published: false });
    expect(await blogFlag()).toBe(false);

    draft.published = true;
    await draft.save();
    expect(await blogFlag()).toBe(true);

    await admin.put(`/api/blog/${draft.id}`).send({ published: false });
    expect(await blogFlag()).toBe(false);

    await admin.put(`/api/blog/${draft.id}`).send({ published: true });
    await admin.delete(`/api/blog/${draft.id}`);
    expect(await blogFlag()).toBe(false);
  });
});

describe('GET /api/blog/:slug/related', () => {
  const related = async (agent, slug) => agent.get(`/api/blog/${slug}/related`);
  const titles = (response) => response.body.data.map((item) => item.title);

  it('orders by shared tags, then newest, and fills with the newest posts', async () => {
    const current = await post({ title: 'Current', tags: ['node', 'auth', 'jwt'] });
    await post({ title: 'One shared, newer', tags: ['node'], daysAgo: 1 });
    await post({ title: 'Two shared', tags: ['auth', 'jwt'], daysAgo: 30 });
    await post({ title: 'No shared, newest', tags: ['css'], daysAgo: 2 });
    await post({ title: 'No shared, oldest', tags: ['css'], daysAgo: 90 });

    const response = await related(visitor(), current.slug);
    expect(response.status).toBe(200);
    expect(titles(response)).toEqual(['Two shared', 'One shared, newer', 'No shared, newest']);
  });

  it('never returns the post itself, drafts or the content field', async () => {
    const current = await post({ title: 'Current', tags: ['node'] });
    await post({ title: 'Draft sharing tags', tags: ['node'], published: false });
    await post({ title: 'Published', tags: ['node'] });

    for (const agent of [visitor(), admin]) {
      const response = await related(agent, current.slug);
      expect(titles(response)).toEqual(['Published']);
      expect(response.body.data[0]).not.toHaveProperty('content');
    }
  });

  it('returns at most three, and an empty list when there is nothing else', async () => {
    const lonely = await post({ title: 'Only post' });
    expect((await related(visitor(), lonely.slug)).body.data).toEqual([]);

    for (let i = 0; i < 5; i += 1) await post({ tags: ['x'] });
    expect((await related(visitor(), lonely.slug)).body.data).toHaveLength(3);
  });

  it('is a 404 for an unknown slug, and for a draft when not signed in', async () => {
    const draft = await post({ title: 'Secret draft', published: false });
    expect((await related(visitor(), 'no-such-post')).status).toBe(404);
    expect((await related(visitor(), draft.slug)).status).toBe(404);
    expect((await related(admin, draft.slug)).status).toBe(200);
  });
});

describe('GET /api/blog/feed.xml', () => {
  const feed = () =>
    visitor()
      .get('/api/blog/feed.xml')
      .buffer(true)
      .parse((res, done) => {
        let text = '';
        res.on('data', (chunk) => {
          text += chunk;
        });
        res.on('end', () => done(null, text));
      });

  it('is valid, empty RSS when there are no posts', async () => {
    const response = await feed();
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/rss\+xml/);
    expect(response.headers['cache-control']).toMatch(/public/);
    expect(response.body).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(response.body).toContain('<rss version="2.0"');
    expect(response.body).toContain('<channel>');
    expect(response.body).not.toContain('<item>');
  });

  it('lists published posts only, newest first, with absolute links', async () => {
    await post({ title: 'Older', daysAgo: 5, tags: ['node'] });
    await post({ title: 'Newer', daysAgo: 1 });
    await post({ title: 'Draft', published: false });

    const { body } = await feed();
    expect(body).not.toContain('Draft');
    expect(body.indexOf('Newer')).toBeLessThan(body.indexOf('Older'));
    expect(body).toMatch(/<link>https?:\/\/[^<]+\/blog\/newer<\/link>/);
    expect(body).toContain('<category>node</category>');
    expect(body).toMatch(/<pubDate>[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4}/);
  });

  it('includes at most 20 posts', async () => {
    for (let i = 0; i < 22; i += 1) await post({ daysAgo: i });
    const { body } = await feed();
    expect(body.match(/<item>/g)).toHaveLength(20);
  });

  it('escapes special characters', async () => {
    await post({
      title: 'Tom & Jerry <script> "quoted"',
      excerpt: "Less < more & 'single'",
      tags: ['a&b'],
    });
    const { body } = await feed();
    expect(body).toContain('Tom &amp; Jerry &lt;script&gt; &quot;quoted&quot;');
    expect(body).toContain('Less &lt; more &amp; &apos;single&apos;');
    expect(body).toContain('<category>a&amp;b</category>');
    expect(body).not.toContain('<script>');
  });
});

describe('review hardening', () => {
  const feedText = async () =>
    (
      await visitor()
        .get('/api/blog/feed.xml')
        .buffer(true)
        .parse((res, done) => {
          let text = '';
          res.on('data', (chunk) => {
            text += chunk;
          });
          res.on('end', () => done(null, text));
        })
    ).body;

  it('ranks an older post with more shared tags above 50 newer partial matches', async () => {
    const current = await post({ title: 'Current', tags: ['a', 'b', 'c'] });
    await post({ title: 'Old but close', tags: ['a', 'b', 'c'], daysAgo: 400 });
    for (let i = 0; i < 52; i += 1) await post({ tags: ['a'], daysAgo: i });

    const response = await visitor().get(`/api/blog/${current.slug}/related`);
    expect(response.body.data[0].title).toBe('Old but close');
    expect(response.body.data).toHaveLength(3);
    expect(response.body.data[0]).not.toHaveProperty('content');
    expect(response.body.data[0]).toHaveProperty('id');
  });

  it('removes characters that are not allowed in XML', async () => {
    await post({
      title: 'Bad\u0001char\u001Ftitle',
      excerpt: 'Ex\u0008cerpt',
      tags: ['t\u000Bag'],
    });
    const body = await feedText();
    expect(body).toContain('<title>Badchartitle</title>');
    expect(body).toContain('<description>Excerpt</description>');
    // eslint-disable-next-line no-control-regex
    expect(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(body)).toBe(false);
  });

  it('omits pubDate for a published post without a publication date', async () => {
    const created = await post({ title: 'No date' });
    await BlogPost.collection.updateOne({ _id: created._id }, { $set: { publishedAt: null } });
    const body = await feedText();
    expect(body).toContain('<title>No date</title>');
    expect(body).not.toContain('<pubDate>');
  });

  it('builds links from the configured site address', async () => {
    await post({ title: 'Linked' });
    const body = await feedText();
    const site = env.mail.siteUrl.replace(/\/+$/, '');
    expect(body).toContain(`<link>${site}/blog/linked</link>`);
    expect(body).toContain(`<link>${site}/blog</link>`);
  });
});

describe('generated excerpts', () => {
  it('follows the content until the admin writes their own excerpt', async () => {
    const created = (
      await admin.post('/api/blog').send({ title: 'Excerpt post', content: 'First opening text.' })
    ).body.data;
    expect(created.excerpt).toBe('First opening text.');

    // The admin form sends the generated excerpt back unchanged with new content.
    const rewritten = await admin
      .put(`/api/blog/${created.id}`)
      .send({ content: 'Rewritten opening text.', excerpt: created.excerpt });
    expect(rewritten.body.data.excerpt).toBe('Rewritten opening text.');

    const custom = await admin
      .put(`/api/blog/${created.id}`)
      .send({ excerpt: 'A summary written by hand.' });
    expect(custom.body.data.excerpt).toBe('A summary written by hand.');

    const later = await admin
      .put(`/api/blog/${created.id}`)
      .send({ content: 'Third version of the text.', excerpt: 'A summary written by hand.' });
    expect(later.body.data.excerpt).toBe('A summary written by hand.');

    const cleared = await admin.put(`/api/blog/${created.id}`).send({ excerpt: '' });
    expect(cleared.body.data.excerpt).toBe('Third version of the text.');
  });
});
