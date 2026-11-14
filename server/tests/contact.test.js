/** Contact form: honeypot, saving, and the once-a-day auto-reply that never repeats visitor text. */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Email is replaced; the real templates are still used to check the auto-reply body.
const mail = vi.hoisted(() => ({ notifications: [], autoReplies: [] }));
vi.mock('../src/services/mailService.js', async () => {
  const { contactAutoReply } = await import('../src/services/emailTemplates.js');
  return {
    sendContactNotification: async (contact) => {
      mail.notifications.push(contact);
      return true;
    },
    sendContactAutoReply: async (contact) => {
      mail.autoReplies.push(
        contactAutoReply(contact, { ownerName: 'Owner', siteUrl: 'https://example.test' }),
      );
      return true;
    },
  };
});

const { agentFor, createTestApp } = await import('./helpers.js');
const { Message } = await import('../src/models/index.js');

const app = createTestApp();
const send = (body) =>
  agentFor(app)
    .post('/api/contact')
    .send({
      name: 'Visitor Name',
      email: 'visitor@example.test',
      subject: 'A secret subject line',
      message: 'This is the private message text.',
      ...body,
    });

beforeEach(() => {
  mail.notifications.length = 0;
  mail.autoReplies.length = 0;
});

describe('POST /api/contact', () => {
  it('stores nothing and sends nothing when the honeypot is filled, but looks successful', async () => {
    const response = await send({ website: 'https://spam.test' });
    expect(response.status).toBe(201);
    expect(await Message.countDocuments()).toBe(0);
    expect(mail.notifications).toHaveLength(0);
    expect(mail.autoReplies).toHaveLength(0);
  });

  it('saves the message, notifies the owner and auto-replies once per address per day', async () => {
    expect((await send({})).status).toBe(201);
    expect((await send({ subject: 'Second message here' })).status).toBe(201);
    expect(await Message.countDocuments()).toBe(2);
    expect(mail.notifications).toHaveLength(2);
    expect(mail.autoReplies).toHaveLength(1);
  });

  it('never repeats the subject or message in the auto-reply', async () => {
    await send({});
    const { subject, text, html } = mail.autoReplies[0];
    for (const part of [subject, text, html]) {
      expect(part).not.toContain('secret subject');
      expect(part).not.toContain('private message');
    }
  });

  it('rejects invalid input', async () => {
    expect((await send({ email: 'not-an-email' })).status).toBe(400);
    expect((await send({ message: 'short' })).status).toBe(400);
    expect((await send({ extra: 'field' })).status).toBe(400);
    expect(await Message.countDocuments()).toBe(0);
  });
});
