import nodemailer from 'nodemailer';
import env from '../config/env.js';
import { contactAutoReply, contactNotification } from './emailTemplates.js';

const { mail } = env;

/** True when SMTP credentials are present. */
export const isMailConfigured = Boolean(mail.user && mail.pass && mail.contactRecipient);

let transporter;

/**
 * Lazily creates the Nodemailer transport.
 * - SMTP configured: real delivery (Gmail by default, using an app password).
 * - Not configured, development: emails are rendered and logged, not sent.
 * - Not configured, production: returns null and sending is skipped.
 */
function getTransporter() {
  if (transporter !== undefined) return transporter;

  if (isMailConfigured) {
    transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.port === 465, // Implicit TLS on 465; STARTTLS on 587.
      auth: { user: mail.user, pass: mail.pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  } else if (!env.isProduction) {
    console.warn('SMTP is not configured. Emails will be logged instead of sent.');
    transporter = nodemailer.createTransport({ jsonTransport: true });
  } else {
    console.warn('SMTP is not configured. Contact emails will not be sent.');
    transporter = null;
  }
  return transporter;
}

/** Sender shown to recipients. Gmail requires the authenticated address. */
function fromAddress() {
  return { name: mail.fromName, address: mail.user || 'no-reply@localhost' };
}

/**
 * Sends one email. Returns true on success; failures are logged, not thrown,
 * because the contact message has already been saved.
 */
async function send(options) {
  const transport = getTransporter();
  if (!transport) return false;

  // `to` may be a plain address or a { name, address } object.
  const recipient = typeof options.to === 'string' ? options.to : options.to?.address;

  try {
    const info = await transport.sendMail({ from: fromAddress(), ...options });
    if (!isMailConfigured) {
      console.log(`Email logged (not sent) to ${recipient}: ${options.subject}`);
    }
    return Boolean(info);
  } catch (error) {
    console.error(`Failed to send email to ${recipient}:`, error.message);
    return false;
  }
}

/** Notifies the site owner. Reply-To is the visitor, so replying goes straight to them. */
export function sendContactNotification(contact) {
  return send({
    to: mail.contactRecipient || 'owner@localhost',
    replyTo: { name: contact.name, address: contact.email },
    ...contactNotification(contact),
  });
}

/** Sends the confirmation email to the visitor. */
export function sendContactAutoReply(contact) {
  return send({
    to: { name: contact.name, address: contact.email },
    ...contactAutoReply(contact, { ownerName: mail.fromName, siteUrl: mail.siteUrl }),
  });
}
