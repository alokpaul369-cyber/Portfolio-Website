import { Message } from '../models/index.js';
import { sendContactAutoReply, sendContactNotification } from '../services/mailService.js';
import { HONEYPOT_FIELD } from '../validators/contactSchemas.js';

const SUCCESS_MESSAGE = 'Thank you for your message. I will get back to you soon.';

/** At most one auto-reply per email address in this window, to prevent email flooding. */
const AUTO_REPLY_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * POST /api/contact
 * Body: { name, email, subject, message } plus the empty honeypot field.
 *
 * 1. Honeypot filled: respond with the normal success message but store and
 *    send nothing, so bots get no signal that they were detected.
 * 2. Save the message to MongoDB.
 * 3. Email the owner, and auto-reply to the visitor unless they already
 *    received one in the last 24 hours. Email failures are logged but do not
 *    fail the request, because the message is already saved.
 */
export async function submitContact(req, res) {
  const { [HONEYPOT_FIELD]: honeypot, ...fields } = req.validated.body;

  if (honeypot) {
    console.warn(`Contact submission discarded by honeypot (ip ${req.ip}).`);
    return res.status(201).json({ success: true, message: SUCCESS_MESSAGE });
  }

  // Checked before saving, so the current message is not counted.
  const recentlyRepliedTo = await Message.exists({
    email: fields.email,
    createdAt: { $gte: new Date(Date.now() - AUTO_REPLY_WINDOW_MS) },
  });

  const message = await Message.create(fields);

  await Promise.all([
    sendContactNotification(message),
    recentlyRepliedTo ? Promise.resolve(false) : sendContactAutoReply(message),
  ]);

  return res.status(201).json({ success: true, message: SUCCESS_MESSAGE });
}
