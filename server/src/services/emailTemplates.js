/**
 * Email content for the contact form.
 * Every template returns { subject, text, html }. The plain-text version is
 * always included for clients that do not render HTML.
 * All visitor-supplied values are HTML-escaped before insertion.
 */

/** Escapes text for safe insertion into HTML. */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Removes line breaks so a value is safe in a single-line header such as Subject. */
function singleLine(value) {
  return String(value ?? '')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

/** Minimal, neutral layout that renders consistently across email clients. */
function layout(bodyHtml) {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f5f6fa;font-family:Arial,Helvetica,sans-serif;color:#343b58;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d8dbe6;border-radius:8px;">
      <tr><td style="padding:28px 32px;font-size:15px;line-height:1.6;">${bodyHtml}</td></tr>
    </table>
  </body>
</html>`;
}

/**
 * Notification sent to the site owner for each new message.
 * @param {{ name: string, email: string, subject: string, message: string, createdAt?: Date }} contact
 */
export function contactNotification(contact) {
  const receivedAt = (contact.createdAt ?? new Date()).toUTCString();
  const subject = `New contact message: ${singleLine(contact.subject)}`.slice(0, 200);

  const text = [
    'You have received a new message through your portfolio contact form.',
    '',
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    `Subject: ${contact.subject}`,
    `Received: ${receivedAt}`,
    '',
    contact.message,
    '',
    'Reply to this email to respond directly to the sender.',
  ].join('\n');

  const row = (label, value) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#6a6f87;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:4px 0;">${value}</td></tr>`;

  const html = layout(`
    <p style="margin:0 0 16px;font-size:17px;font-weight:bold;">New contact message</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;font-size:14px;">
      ${row('Name', escapeHtml(contact.name))}
      ${row('Email', `<a href="mailto:${escapeHtml(contact.email)}" style="color:#2e5bd8;">${escapeHtml(contact.email)}</a>`)}
      ${row('Subject', escapeHtml(contact.subject))}
      ${row('Received', escapeHtml(receivedAt))}
    </table>
    <div style="padding:16px;background:#f5f6fa;border-radius:6px;white-space:pre-wrap;">${escapeHtml(contact.message)}</div>
    <p style="margin:20px 0 0;font-size:13px;color:#6a6f87;">Reply to this email to respond directly to the sender.</p>
  `);

  return { subject, text, html };
}

/**
 * Confirmation sent to the visitor.
 * It deliberately does not repeat the visitor's message or subject, so the
 * form cannot be used to send arbitrary content to third-party addresses.
 *
 * @param {{ name: string }} contact
 * @param {{ ownerName: string, siteUrl: string }} options
 */
export function contactAutoReply(contact, { ownerName, siteUrl }) {
  const firstName = singleLine(contact.name).split(' ')[0].slice(0, 40);
  const subject = `Thank you for your message`;

  const text = [
    `Hello ${firstName},`,
    '',
    `Thank you for getting in touch. This is a confirmation that your message has been received. I usually reply within two business days.`,
    '',
    'Best regards,',
    ownerName,
    siteUrl,
    '',
    'This is an automated message. If you did not use the contact form on this website, you can ignore this email.',
  ].join('\n');

  const html = layout(`
    <p style="margin:0 0 16px;">Hello ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 16px;">Thank you for getting in touch. This is a confirmation that your message has been received. I usually reply within two business days.</p>
    <p style="margin:0 0 4px;">Best regards,</p>
    <p style="margin:0;">${escapeHtml(ownerName)}<br /><a href="${escapeHtml(siteUrl)}" style="color:#2e5bd8;">${escapeHtml(siteUrl)}</a></p>
    <p style="margin:24px 0 0;font-size:12px;color:#6a6f87;">This is an automated message. If you did not use the contact form on this website, you can ignore this email.</p>
  `);

  return { subject, text, html };
}
