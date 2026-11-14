import { Message } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { containsRegex, paginate } from '../utils/query.js';

/** MongoDB filter for the inbox's status and search, shared by the list and the export. */
function inboxFilter(status, search) {
  const filter = {};
  if (status === 'unread') filter.read = false;
  if (status === 'read') filter.read = true;
  if (search) {
    const pattern = containsRegex(search);
    filter.$or = [
      { name: pattern },
      { email: pattern },
      { subject: pattern },
      { message: pattern },
    ];
  }
  return filter;
}

/**
 * GET /api/messages (admin)
 * Query: page, limit, status (all | unread | read), search
 * Newest first. Includes the unread total for the inbox badge.
 */
export async function listMessages(req, res) {
  const { page, limit, status, search } = req.validated.query;
  const filter = inboxFilter(status, search);

  const [result, unreadCount] = await Promise.all([
    // _id breaks ties between messages saved in the same millisecond.
    paginate(Message, { filter, sort: { createdAt: -1, _id: -1 }, page, limit }),
    Message.countDocuments({ read: false }),
  ]);
  res.json({ success: true, ...result, unreadCount });
}

/** PATCH /api/messages/:id (admin) Marks a message as read or unread. */
export async function updateMessage(req, res) {
  const message = await Message.findByIdAndUpdate(
    req.validated.params.id,
    { read: req.validated.body.read },
    { returnDocument: 'after', runValidators: true },
  );
  if (!message) throw ApiError.notFound('Message not found');
  res.json({ success: true, data: message });
}

/** DELETE /api/messages/:id (admin) */
export async function deleteMessage(req, res) {
  const message = await Message.findByIdAndDelete(req.validated.params.id);
  if (!message) throw ApiError.notFound('Message not found');
  res.json({ success: true, message: 'Message deleted' });
}

/**
 * POST /api/messages/bulk (admin)  Body: { ids, action }
 * Marks several messages read or unread, or deletes them. Ids that no longer
 * exist are skipped, so a list that is slightly out of date still works.
 * Returns how many messages were changed.
 */
export async function bulkUpdateMessages(req, res) {
  const { action } = req.validated.body;
  const ids = [...new Set(req.validated.body.ids)];
  const filter = { _id: { $in: ids } };

  const changed =
    action === 'delete'
      ? (await Message.deleteMany(filter)).deletedCount
      : (await Message.updateMany(filter, { read: action === 'read' })).matchedCount;

  res.json({ success: true, message: 'Messages updated', data: { changed } });
}

/** Most rows one export may contain. */
const MAX_EXPORT_ROWS = 5000;

/** A leading character that makes a spreadsheet treat the cell as a formula. */
const FORMULA_START = /^[=+\-@\t\r]/;

/**
 * One CSV cell: always quoted, inner quotes doubled, and prefixed with an
 * apostrophe when a spreadsheet would otherwise run it as a formula.
 */
function csvCell(value) {
  let text = String(value ?? '');
  if (FORMULA_START.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/**
 * GET /api/messages/export (admin)  Query: status, search
 * The matching messages, newest first, as a CSV download. The byte-order mark
 * lets Excel read non-English text (such as Bangla) correctly.
 */
export async function exportMessages(req, res) {
  const { status, search } = req.validated.query;
  const messages = await Message.find(inboxFilter(status, search))
    .sort({ createdAt: -1, _id: -1 })
    .limit(MAX_EXPORT_ROWS)
    .lean();

  const rows = [
    ['Date', 'Name', 'Email', 'Subject', 'Message', 'Read'],
    ...messages.map((m) => [
      m.createdAt.toISOString(),
      m.name,
      m.email,
      m.subject,
      m.message,
      m.read ? 'yes' : 'no',
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
  const filename = `messages-${new Date().toISOString().slice(0, 10)}.csv`;

  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
    // Personal data: never kept by the browser cache or a proxy.
    'Cache-Control': 'no-store',
  });
  res.send(csv);
}
