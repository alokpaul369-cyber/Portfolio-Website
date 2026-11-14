/** Inbox tools: bulk actions and CSV export. */
import { beforeEach, describe, expect, it } from 'vitest';
import { agentFor, createTestApp, loginAgent } from './helpers.js';
import { Message } from '../src/models/index.js';

const app = createTestApp();
let admin;

let counter = 0;
async function message(overrides = {}) {
  counter += 1;
  return Message.create({
    name: `Sender ${counter}`,
    email: `sender${counter}@example.test`,
    subject: `Subject number ${counter}`,
    message: `Message body number ${counter}.`,
    ...overrides,
  });
}

beforeEach(async () => {
  admin = await loginAgent(app);
});

describe('POST /api/messages/bulk', () => {
  const bulk = (agent, body) => agent.post('/api/messages/bulk').send(body);

  it('rejects a visitor', async () => {
    const one = await message();
    expect((await bulk(agentFor(app), { ids: [one.id], action: 'read' })).status).toBe(401);
  });

  it('marks messages read and unread', async () => {
    const [a, b, c] = [await message(), await message(), await message()];
    const read = await bulk(admin, { ids: [a.id, b.id], action: 'read' });
    expect(read.status).toBe(200);
    expect(read.body.data.changed).toBe(2);
    expect((await Message.findById(a.id)).read).toBe(true);
    expect((await Message.findById(c.id)).read).toBe(false);

    await bulk(admin, { ids: [a.id], action: 'unread' });
    expect((await Message.findById(a.id)).read).toBe(false);
  });

  it('deletes messages and ignores ids that no longer exist', async () => {
    const [a, b] = [await message(), await message()];
    const missing = '507f1f77bcf86cd799439011';
    const response = await bulk(admin, { ids: [a.id, missing, a.id], action: 'delete' });
    expect(response.status).toBe(200);
    expect(response.body.data.changed).toBe(1);
    expect(await Message.exists({ _id: a.id })).toBeNull();
    expect(await Message.exists({ _id: b.id })).not.toBeNull();
  });

  it.each([
    [{ ids: [], action: 'read' }],
    [{ ids: Array(101).fill('507f1f77bcf86cd799439011'), action: 'read' }],
    [{ ids: ['not-an-id'], action: 'read' }],
    [{ ids: ['507f1f77bcf86cd799439011'], action: 'archive' }],
    [{ ids: ['507f1f77bcf86cd799439011'] }],
    [{ ids: ['507f1f77bcf86cd799439011'], action: 'read', extra: true }],
  ])('rejects an invalid request %#', async (body) => {
    expect((await bulk(admin, body)).status).toBe(400);
  });
});

describe('GET /api/messages/export', () => {
  const exportCsv = (agent, query = '') =>
    agent
      .get(`/api/messages/export${query}`)
      .buffer(true)
      .parse((res, done) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => done(null, Buffer.concat(chunks).toString('utf8')));
      });

  it('rejects a visitor', async () => {
    expect((await exportCsv(agentFor(app))).status).toBe(401);
  });

  it('downloads a CSV file with a header row, newest first', async () => {
    await message({ name: 'Older' });
    await message({ name: 'Newer' });
    const response = await exportCsv(admin);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/csv/);
    expect(response.headers['content-disposition']).toMatch(
      /attachment; filename="messages-\d{4}-\d{2}-\d{2}\.csv"/,
    );
    expect(response.headers['cache-control']).toMatch(/no-store/);

    const body = response.body;
    expect(body.startsWith('﻿')).toBe(true);
    const lines = body.slice(1).split('\r\n');
    expect(lines[0]).toBe('"Date","Name","Email","Subject","Message","Read"');
    expect(lines[1]).toContain('"Newer"');
    expect(lines[2]).toContain('"Older"');
    expect(lines[1]).toMatch(/^"\d{4}-\d{2}-\d{2}T[\d:.]+Z"/);
    expect(lines[1].endsWith('"no"')).toBe(true);
  });

  it('follows the status and search filters', async () => {
    await message({ name: 'Read one', read: true });
    await message({ name: 'Unread one', subject: 'Internship enquiry' });
    const unread = (await exportCsv(admin, '?status=unread')).body;
    expect(unread).toContain('Unread one');
    expect(unread).not.toContain('Read one"');

    const searched = (await exportCsv(admin, '?search=internship')).body;
    expect(searched).toContain('Unread one');
    expect(searched).not.toContain('Read one"');
  });

  it('quotes commas, quotes and line breaks', async () => {
    await message({
      name: 'Doe, Jane',
      subject: 'A "quoted" subject',
      message: 'Line one\nLine two',
    });
    const body = (await exportCsv(admin)).body;
    expect(body).toContain('"Doe, Jane"');
    expect(body).toContain('"A ""quoted"" subject"');
    expect(body).toContain('"Line one\nLine two"');
  });

  it('neutralises text that a spreadsheet would run as a formula', async () => {
    await message({
      name: '=HYPERLINK("http://evil.test")',
      subject: '+SUM(A1:A2) subject',
      message: '-2+3 is the message @start',
    });
    const body = (await exportCsv(admin)).body;
    expect(body).toContain('"\'=HYPERLINK(""http://evil.test"")"');
    expect(body).toContain('"\'+SUM(A1:A2) subject"');
    expect(body).toContain('"\'-2+3 is the message @start"');
  });

  it('returns only the header for an empty inbox', async () => {
    const body = (await exportCsv(admin)).body;
    expect(body.slice(1).trim()).toBe('"Date","Name","Email","Subject","Message","Read"');
  });
});
